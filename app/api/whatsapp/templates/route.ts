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

        const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
        const check = await ensureFeatureEnabled(userId, 'whatsapp');
        if (check) return check;

        const body = await req.json();
        const { name, type, content, link, caption, variables } = body;

        if (!name?.trim())
            return NextResponse.json({ error: "Name is required" }, { status: 400 });

        // Validate for TEXT type
        if (type === "TEXT" && !content?.trim())
            return NextResponse.json({ error: "Content is required for TEXT type" }, { status: 400 });

        // Validate for NON-TEXT type
        if (type !== "TEXT" && !link?.trim())
            return NextResponse.json({ error: "Media URL required" }, { status: 400 });

        // Validate sequential variables
        const variableRegex = /{{(\d+)}}/g;
        let numbers: number[] = [];
        const textToCheck = type === "TEXT" ? content : caption;

        let match;
        while ((match = variableRegex.exec(textToCheck)) !== null) {
            numbers.push(Number(match[1]));
        }

        if (numbers.length > 0) {
            const sorted = [...numbers].sort((a, b) => a - b);
            for (let i = 0; i < sorted.length; i++) {
                if (sorted[i] !== i + 1) {
                    return NextResponse.json({
                        error: "Variables must be sequential: {{1}}, {{2}}, ..."
                    }, { status: 400 });
                }
            }

            // Validate that variables array matches the number of placeholders
            if (!variables || variables.length !== numbers.length) {
                return NextResponse.json({
                    error: `Found ${numbers.length} variable placeholder(s) but received ${variables?.length || 0} variable key(s). Please use the + button to add variables.`
                }, { status: 400 });
            }
        }

        // Validate content quality (basic checks)
        const contentToValidate = type === "TEXT" ? content : (caption || "");
        if (contentToValidate) {
            // Check for common spelling mistakes that Meta rejects
            const commonIssues = [
                { pattern: /\bplz\b/i, message: "Use 'please' instead of 'plz'" },
                { pattern: /\bu\b(?!\w)/i, message: "Use 'you' instead of 'u'" },
                { pattern: /\bpls\b/i, message: "Use 'please' instead of 'pls'" },
                { pattern: /\bthnx\b/i, message: "Use 'thanks' instead of 'thnx'" },
            ];

            for (const issue of commonIssues) {
                if (issue.pattern.test(contentToValidate)) {
                    return NextResponse.json({
                        error: `Template quality issue: ${issue.message}. Meta may reject informal language.`
                    }, { status: 400 });
                }
            }
        }

        const account = await WhatsAppAccount.findOne({ owner: userId });
        if (!account)
            return NextResponse.json({ error: "WhatsApp account not found" }, { status: 404 });

        const rawToken = decryptToken(account.waTokenEncrypted);

        // ------------------------------------------
        // 🔥 STEP 1: Detect Language Automatically
        // ------------------------------------------
        function detectLanguage(text: string) {
            if (/[\u0600-\u06FF]/.test(text)) return "ar_AR";
            if (/[éàèçùâêîôûëï]/i.test(text)) return "fr_FR";
            return "en_US";
        }

        const language = detectLanguage(content || caption || name);

        // ------------------------------------------
        // 🔥 STEP 2: Create Meta-Safe Template Name
        // ------------------------------------------
        const metaName =
            name.trim().toLowerCase().replace(/\s+/g, "_") +
            "_" +
            Math.floor(Date.now() / 1000);

        // ------------------------------------------
        // 🔥 STEP 3: REAL EXAMPLE VALUES
        // ------------------------------------------
        // Map variable keys to realistic example values
        const exampleMap: Record<string, string> = {
            // Customer Information
            fullName: "John Doe",
            email: "john@example.com",
            phone: "+1234567890",
            address: "123 Main Street, Apt 4B",
            city: "New York",
            country: "USA",
            
            // Order Information
            totalAmount: "149.99",
            status: "confirmed",
            deliveryInstructions: "Please ring the doorbell",
            preferredTime: "2:00 PM - 4:00 PM",
            deliveryCompany: "Express Delivery",
            
            // Product Information (first product)
            productName: "Premium T-Shirt",
            productQuantity: "2",
            productPrice: "49.99",
            productColor: "Blue",
            productSize: "Large",
            
            // Product Lists
            productsList: "1. Premium T-Shirt (Blue, Large) x2 - $49.99\n2. Cotton Jeans (Black, 32) x1 - $59.99",
            totalItems: "3",
            
            // Legacy/fallback
            createdAt: "2025-12-01",
            updatedAt: "2025-12-01"
        };
        const exampleValues = variables?.length
            ? variables.map((v: string) => exampleMap[v] || `Example for ${v}`)
            : [];

        // ------------------------------------------
        // 🔥 STEP 4: Upload Media (FAST APPROVAL)
        // ------------------------------------------
        let mediaHandle: string | undefined = undefined;

        if (type !== "TEXT") {
            try {
                const mediaRes = await fetch(
                    `https://graph.facebook.com/v20.0/${account.waBusinessId}/media`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${rawToken}`
                        },
                        body: JSON.stringify({
                            messaging_product: "whatsapp",
                            file: link
                        })
                    }
                );

                const mediaData = await mediaRes.json();

                if (!mediaRes.ok) {
                    console.error("Media upload error:", mediaData);
                } else {
                    mediaHandle = mediaData.id;
                }
            } catch (err) {
                console.error("Media upload error:", err);
            }
        }

        // ------------------------------------------
        // 🔥 STEP 5: Build components
        // ------------------------------------------
        const components: any[] = [];

        if (type === "TEXT") {
            components.push({
                type: "BODY",
                text: content,
                example: exampleValues.length
                    ? { body_text: [exampleValues] }
                    : undefined
            });
        } else {
            let format = type === "AUDIO" ? "DOCUMENT" : type;

            components.push({
                type: "HEADER",
                format,
                example: mediaHandle
                    ? { header_handle: [mediaHandle] }
                    : { header_link: [link] }
            });

            components.push({
                type: "BODY",
                text: caption || " ",
                example: exampleValues.length
                    ? { body_text: [exampleValues] }
                    : undefined
            });
        }

        // ------------------------------------------
        // 🔥 STEP 6: Check for unique name and metaName
        // ------------------------------------------
        const existing = await Template.findOne({ name: name.trim() });
        if (existing) {
            return NextResponse.json({ error: "Template name must be unique" }, { status: 400 });
        }
        const existingMeta = await Template.findOne({ metaName });
        if (existingMeta) {
            return NextResponse.json({ error: "Internal error: metaName collision, try again" }, { status: 500 });
        }
        const newTemplate = await Template.create({
            owner: userId,
            name: name.trim(),
            metaName,
            type,
            content,
            link,
            caption,
            variables,
            status: "PENDING",
            category: type === "TEXT" ? "UTILITY" : "MARKETING",
            language
        });

        // ------------------------------------------
        // 🔥 STEP 7: SEND TEMPLATE TO META
        // ------------------------------------------
        const metaRes = await fetch(
            `https://graph.facebook.com/v20.0/${account.waBusinessId}/message_templates`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${rawToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: metaName,
                    language,
                    category: type === "TEXT" ? "UTILITY" : "MARKETING",
                    components
                })
            }
        );

        const metaData = await metaRes.json();
        console.log("Meta template creation:", metaData);

        if (metaData.error) {
            newTemplate.status = "REJECTED";
            newTemplate.rejectionReason =
                metaData.error.error_user_msg ||
                metaData.error.message ||
                "Template rejected by Meta";
        } else {
            newTemplate.status = "PENDING";
        }

        await newTemplate.save();

        return NextResponse.json({ template: newTemplate });
    } catch (err: any) {
        console.error("POST /templates error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
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
        // Update fields safely (do NOT change category)
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

            // Example values map for variables (used in PUT as well)
            const exampleMap: Record<string, string> = {
                // Customer Information
                fullName: "John Doe",
                email: "john@example.com",
                phone: "+1234567890",
                address: "123 Main Street, Apt 4B",
                city: "New York",
                country: "USA",
                
                // Order Information
                totalAmount: "149.99",
                status: "confirmed",
                deliveryInstructions: "Please ring the doorbell",
                preferredTime: "2:00 PM - 4:00 PM",
                deliveryCompany: "Express Delivery",
                
                // Product Information (first product)
                productName: "Premium T-Shirt",
                productQuantity: "2",
                productPrice: "49.99",
                productColor: "Blue",
                productSize: "Large",
                
                // Product Lists
                productsList: "1. Premium T-Shirt (Blue, Large) x2 - $49.99\n2. Cotton Jeans (Black, 32) x1 - $59.99",
                totalItems: "3",
            };
            const exampleValues: string[] = Array.isArray(variables)
                ? (variables as string[]).map((v) => exampleMap[v] || `Example for ${v}`)
                : [];

            if (type === "TEXT") {
                // Text templates only need BODY component
                const bodyComponent: any = {
                    type: "BODY",
                    text: content,
                };
                // Add variables if provided
                if (variables && variables.length > 0) {
                    // Meta expects an array of arrays of strings: [["val1", "val2"]]
                    bodyComponent.example = {
                        body_text: [exampleValues],
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
                            body_text: [exampleValues],
                        };
                    }
                    components.push(bodyComponent);
                } else if (!caption && variables && variables.length > 0) {
                    const bodyComponent: any = {
                        type: "BODY",
                        text: " ",
                    };
                        bodyComponent.example = {
                            body_text: [exampleValues],
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
                            category: template.category, // Use stored category, do NOT change
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

        if (!id) {
            return NextResponse.json({ error: "Template ID required" }, { status: 400 });
        }

        const template = await Template.findOne({ _id: id, owner: userId });
        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        // If template is REJECTED, delete directly from DB without checking Meta
        if (template.status === "REJECTED") {
            await template.deleteOne();
            return NextResponse.json({ success: true });
        }

        // Fetch WhatsApp account for Meta credentials
        const account = await WhatsAppAccount.findOne({ owner: userId });
        if (!account) {
            return NextResponse.json({ error: "WhatsApp account not found" }, { status: 404 });
        }

        const rawToken = decryptToken(account.waTokenEncrypted);

        // Use metaName for Meta template deletion
        const metaTemplateName = template.metaName;

        // Delete from Meta
        const deleteRes = await fetch(
            `https://graph.facebook.com/v20.0/${account.waBusinessId}/message_templates?name=${metaTemplateName}&language=en_US`,
            {
                method: "DELETE",
                headers: { Authorization: `Bearer ${rawToken}` },
            }
        );

        const metaData = await deleteRes.json();

        if (!deleteRes.ok) {
            console.error("Meta delete error:", metaData);
            return NextResponse.json(
                { error: metaData.error?.message || "Failed to delete template from Meta" },
                { status: 400 }
            );
        }

        // Delete from DB AFTER Meta success
        await template.deleteOne();

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("DELETE /templates error:", err);
        const status = err.message === "Unauthorized" ? 401 : 500;
        return NextResponse.json({ error: err.message }, { status });
    }
}

