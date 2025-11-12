import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Template from "@/models/templates";
import WhatsAppAccount from "@/models/whatsappAccount";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { decryptToken } from "../webhook/route";

async function getUserId(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    return session.user.id;
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const userId = await getUserId(req);

        // Ensure WhatsApp feature is available for this user
        const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
        const check = await ensureFeatureEnabled(userId, 'whatsapp');
        if (check) return check;

        const account = await WhatsAppAccount.findOne({ owner: userId });
        if (!account) return NextResponse.json({ error: "WhatsApp account not found" }, { status: 404 });

        const templates = await Template.find({ owner: userId }).sort({ createdAt: -1 });

        // ✅ FIX: Refresh pending/rejected templates from Meta to get latest status
        const rawToken = decryptToken(account.waTokenEncrypted);
        for (const template of templates) {
            // Refresh status for PENDING templates, and also check REJECTED in case they were updated
            if (template.status === "PENDING" || template.status === "REJECTED") {
                try {
                    const nameSlug = template.name.trim().toLowerCase().replace(/\s+/g, "_");
                    const res = await fetch(
                        `https://graph.facebook.com/v20.0/${account.waBusinessId}/message_templates?name=${nameSlug}`,
                        { headers: { Authorization: `Bearer ${rawToken}` } }
                    );
                    const metaData = await res.json();
                    
                    if (metaData.error) {
                        console.error(`Meta fetch error for template ${template.name}:`, metaData.error);
                        continue;
                    }
                    
                    if (metaData.data?.length > 0) {
                        const metaTemplate = metaData.data[0];
                        
                        // ✅ FIX: Meta returns status as "APPROVED", "REJECTED", or "PENDING" (uppercase)
                        // Also check review_status field
                        const metaStatus = metaTemplate.status || metaTemplate.review_status;
                        if (metaStatus) {
                                const normalizedStatus: string = metaStatus.toUpperCase();
                                const validStatus = normalizedStatus === "APPROVED" || normalizedStatus === "REJECTED" || normalizedStatus === "PENDING";
                                if (validStatus) {
                                template.status = normalizedStatus;
                                
                                // Update rejection reason if rejected
                                if (normalizedStatus === "REJECTED") {
                                    template.rejectionReason = metaTemplate.rejection_reason || metaTemplate.reason || "Template rejected by Meta";
                                } else {
                                    // Clear rejection reason if approved
                                    template.rejectionReason = undefined;
                                }
                                
                                await template.save();
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Meta fetch error for template ${template.name}:`, err);
                }
            }
        }

        return NextResponse.json({ templates });
    } catch (err: any) {
        console.error("GET /templates error:", err);
        const status = err.message === "Unauthorized" ? 401 : 500;
        return NextResponse.json({ error: err.message }, { status });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const userId = await getUserId(req);
        // Ensure WhatsApp feature is available for this user before creating templates
        const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
        const check = await ensureFeatureEnabled(userId, 'whatsapp');
        if (check) return check;
        const { name, type, content, link, caption, variables } = await req.json();

        if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
        if (type === "TEXT" && !content?.trim())
            return NextResponse.json({ error: "Content is required for TEXT type" }, { status: 400 });
        if (type !== "TEXT" && !link?.trim())
            return NextResponse.json({ error: "Media URL is required for media templates" }, { status: 400 });

        const account = await WhatsAppAccount.findOne({ owner: userId });
        if (!account) return NextResponse.json({ error: "WhatsApp account not found" }, { status: 404 });

        const rawToken = decryptToken(account.waTokenEncrypted);

        const newTemplate = await Template.create({
            owner: userId,
            name: name.trim(),
            type,
            content: content?.trim(),
            link: link?.trim(),
            caption: caption?.trim(),
            variables: variables || [],
            status: "PENDING",
        });

        // Build components according to Meta WhatsApp Business API policies
        const components: any[] = [];
        if (type === "TEXT") {
            // Text templates only need BODY component
            const bodyComponent: any = {
                type: "BODY",
                text: content,
            };
            // Add variables if provided
            if (variables && variables.length > 0) {
                bodyComponent.example = {
                    body_text: [variables.map((v: string, i: number) => `{{${i + 1}}}`).join(" ")],
                };
            }
            components.push(bodyComponent);
        } else {
            // ✅ FIXED: Media templates (IMAGE, VIDEO, DOCUMENT) must use HEADER with proper format
            // Meta requires header_handle for media URLs or header_link for external URLs
            // For template creation, we use header_handle with example URLs
            
            // Normalize media type to Meta's expected format
            let metaFormat: string;
            switch (type) {
                case "IMAGE":
                    metaFormat = "IMAGE";
                    break;
                case "VIDEO":
                    metaFormat = "VIDEO";
                    break;
                case "DOCUMENT":
                    metaFormat = "DOCUMENT";
                    break;
                case "AUDIO":
                    metaFormat = "DOCUMENT"; // Audio files are sent as documents
                    break;
                default:
                    metaFormat = "IMAGE";
            }
            
            const headerComponent: any = {
                type: "HEADER",
                format: metaFormat,
            };
            
            // ✅ FIXED: Meta requires header_handle for uploaded media or header_link for external URLs
            // Check if link is a WhatsApp handle or external URL
            if (link) {
                // If it's a WhatsApp handle (starts with https://lookaside.fbsbx.com or similar)
                // Otherwise treat as external URL
                if (link.includes('fbsbx.com') || link.includes('scontent') || link.includes('fbcdn')) {
                    headerComponent.example = {
                        header_handle: [link], // WhatsApp uploaded media handle
                    };
                } else {
                    // External URL - use header_link
                    headerComponent.example = {
                        header_link: [link], // External URL
                    };
                }
            }
            
            components.push(headerComponent);

            // ✅ FIXED: Media templates can have BODY with caption (optional)
            if (caption && caption.trim()) {
                const bodyComponent: any = {
                    type: "BODY",
                    text: caption,
                };
                // Add variables if provided
                if (variables && variables.length > 0) {
                    bodyComponent.example = {
                        body_text: [variables.map((v: string, i: number) => `{{${i + 1}}}`).join(" ")],
                    };
                }
                components.push(bodyComponent);
            } else if (!caption && variables && variables.length > 0) {
                // If no caption but variables exist, still need BODY component for variables
                const bodyComponent: any = {
                    type: "BODY",
                    text: " ", // Empty body with variables (Meta allows this)
                };
                bodyComponent.example = {
                    body_text: [variables.map((v: string, i: number) => `{{${i + 1}}}`).join(" ")],
                };
                components.push(bodyComponent);
            }
        }
        
        // Send to Meta
        try {
            const templateName = name.trim().toLowerCase().replace(/\s+/g, "_");
            const res = await fetch(
                `https://graph.facebook.com/v20.0/${account.waBusinessId}/message_templates`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${rawToken}`, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: templateName,
                        category: type === "TEXT" ? "UTILITY" : "MARKETING", // ✅ FIXED: Media templates should use MARKETING category
                        language: "en_US",
                        components,
                    }),
                }
            );
            
            const metaData = await res.json();
            console.log("Meta template creation response:", metaData);
            
            if (metaData.error) {
                newTemplate.status = "REJECTED";
                newTemplate.rejectionReason = metaData.error.message || metaData.error.error_user_msg || "Template rejected by Meta";
                await newTemplate.save();
            } else if (metaData.id) {
                // ✅ FIX: Meta returns id on success, status comes later via webhook or GET request
                // Store Meta template ID for future reference
                newTemplate.status = "PENDING"; // Always PENDING initially, Meta reviews asynchronously
                
                // Optionally fetch the template to get initial status
                try {
                    const statusRes = await fetch(
                        `https://graph.facebook.com/v20.0/${metaData.id}`,
                        { headers: { Authorization: `Bearer ${rawToken}` } }
                    );
                    const statusData = await statusRes.json();
                    
                    // ✅ FIX: Meta uses "status" field, normalize to uppercase
                    if (statusData.status) {
                        const normalizedStatus = statusData.status.toUpperCase();
                        if (normalizedStatus === "APPROVED" || normalizedStatus === "REJECTED" || normalizedStatus === "PENDING") {
                            newTemplate.status = normalizedStatus;
                        }
                        if (normalizedStatus === "REJECTED" && statusData.rejection_reason) {
                            newTemplate.rejectionReason = statusData.rejection_reason;
                        }
                    }
                } catch (statusErr) {
                    console.error("Failed to fetch template status:", statusErr);
                    // Continue with PENDING status
                }
                
                await newTemplate.save();
            } else {
                // Unexpected response format
                newTemplate.status = "PENDING";
                await newTemplate.save();
            }
        } catch (err: any) {
            console.error("Meta template creation failed:", err);
            newTemplate.status = "REJECTED";
            newTemplate.rejectionReason = err.message || "Failed to send template to Meta";
            await newTemplate.save();
        }

        return NextResponse.json({ template: newTemplate });
    } catch (err: any) {
        console.error("POST /templates error:", err);
        const status = err.message === "Unauthorized" ? 401 : 500;
        return NextResponse.json({ error: err.message }, { status });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const userId = await getUserId(req);
        const { id, name, type, content, link, caption, variables } = await req.json();

        if (!id || !name?.trim()) {
        return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
        }

        const template = await Template.findOne({ _id: id, owner: userId });
        if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        // Update fields safely
        template.name = name.trim();
        template.type = type || template.type;
        template.content = content?.trim();
        template.link = link?.trim();
        template.caption = caption?.trim();
        template.variables = variables || [];
        template.status = "PENDING";
        template.rejectionReason = undefined;

        const account = await WhatsAppAccount.findOne({ owner: userId });
        if (account) {
        const rawToken = decryptToken(account.waTokenEncrypted);

        // Build components according to Meta WhatsApp Business API policies
        const components: any[] = [];

            if (type === "TEXT") {
                // Text templates only need BODY component
                const bodyComponent: any = {
                    type: "BODY",
                    text: content,
                };
                // Add variables if provided
                if (variables && variables.length > 0) {
                    bodyComponent.example = {
                        body_text: [variables.map((v: string, i: number) => `{{${i + 1}}}`).join(" ")],
                    };
                }
                components.push(bodyComponent);
            } else {
                // ✅ FIXED: Media templates (IMAGE, VIDEO, DOCUMENT) must use HEADER with proper format
                let metaFormat: string;
                switch (type) {
                    case "IMAGE":
                        metaFormat = "IMAGE";
                        break;
                    case "VIDEO":
                        metaFormat = "VIDEO";
                        break;
                    case "DOCUMENT":
                        metaFormat = "DOCUMENT";
                        break;
                    case "AUDIO":
                        metaFormat = "DOCUMENT";
                        break;
                    default:
                        metaFormat = "IMAGE";
                }
                
                const headerComponent: any = {
                    type: "HEADER",
                    format: metaFormat,
                };
                
                // ✅ FIXED: Use header_handle for WhatsApp media or header_link for external URLs
                if (link) {
                    if (link.includes('fbsbx.com') || link.includes('scontent') || link.includes('fbcdn')) {
                        headerComponent.example = {
                            header_handle: [link],
                        };
                    } else {
                        headerComponent.example = {
                            header_link: [link],
                        };
                    }
                }
                
                components.push(headerComponent);

                // ✅ FIXED: Media templates can have BODY with caption (optional)
                if (caption && caption.trim()) {
                    const bodyComponent: any = {
                        type: "BODY",
                        text: caption,
                    };
                    if (variables && variables.length > 0) {
                        bodyComponent.example = {
                            body_text: [variables.map((v: string, i: number) => `{{${i + 1}}}`).join(" ")],
                        };
                    }
                    components.push(bodyComponent);
                } else if (!caption && variables && variables.length > 0) {
                    const bodyComponent: any = {
                        type: "BODY",
                        text: " ",
                    };
                        bodyComponent.example = {
                            body_text: [variables.map((v: string, i: number) => `{{${i + 1}}}`).join(" ")],
                        };
                    components.push(bodyComponent);
                }
            }

            try {
                const templateName = name.trim().toLowerCase().replace(/\s+/g, "_");
                const res = await fetch(
                    `https://graph.facebook.com/v20.0/${account.waBusinessId}/message_templates`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${rawToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name: templateName,
                            category: type === "TEXT" ? "UTILITY" : "MARKETING", // ✅ FIXED: Media templates use MARKETING category
                            language: "en_US",
                            components,
                        }),
                    }
                );

                const metaData = await res.json();
                console.log("Meta template update response:", metaData);

                if (metaData.error) {
                    template.status = "REJECTED";
                    template.rejectionReason = metaData.error.message || metaData.error.error_user_msg || "Template rejected by Meta";
                } else if (metaData.id) {
                    // ✅ FIX: Meta returns id on success, fetch status separately
                    template.status = "PENDING";
                    
                    // Fetch the template status
                    try {
                        const statusRes = await fetch(
                            `https://graph.facebook.com/v20.0/${metaData.id}`,
                            { headers: { Authorization: `Bearer ${rawToken}` } }
                        );
                        const statusData = await statusRes.json();
                        
                        // ✅ FIX: Normalize status from Meta
                        if (statusData.status) {
                            const normalizedStatus = statusData.status.toUpperCase();
                            if (normalizedStatus === "APPROVED" || normalizedStatus === "REJECTED" || normalizedStatus === "PENDING") {
                                template.status = normalizedStatus;
                            }
                            if (normalizedStatus === "REJECTED" && statusData.rejection_reason) {
                                template.rejectionReason = statusData.rejection_reason;
                            } else if (normalizedStatus !== "REJECTED") {
                                template.rejectionReason = undefined;
                            }
                        }
                    } catch (statusErr) {
                        console.error("Failed to fetch template status:", statusErr);
                        // Continue with PENDING status
                    }
                } else {
                    // Unexpected response
                    template.status = "PENDING";
                }
            } catch (err: any) {
                console.error("Meta template creation failed:", err);
                template.status = "REJECTED";
                template.rejectionReason = err.message || "Failed to send template to Meta";
            }
        }

        await template.save();
        return NextResponse.json({ template });
    } catch (err: any) {
        console.error("PUT /templates error:", err);
        const status = err.message === "Unauthorized" ? 401 : 500;
        return NextResponse.json({ error: err.message }, { status });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const userId = await getUserId(req);
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Template ID required" }, { status: 400 });

        const deleted = await Template.findOneAndDelete({ _id: id, owner: userId });
        if (!deleted) return NextResponse.json({ error: "Template not found" }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("DELETE /templates error:", err);
        const status = err.message === "Unauthorized" ? 401 : 500;
        return NextResponse.json({ error: err.message }, { status });
    }
}
