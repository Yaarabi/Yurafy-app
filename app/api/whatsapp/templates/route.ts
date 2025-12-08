import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Template from "@/models/automation/templates";
import WhatsAppAccount from "@/models/automation/whatsappAccount";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { decryptToken } from "../webhook/route";
import { del } from "@vercel/blob";

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
                                // Use updateOne to avoid version conflict with existing documents
                                const updateData: any = { status: normalizedStatus };
                                
                                // Update rejection reason if rejected
                                if (normalizedStatus === "REJECTED") {
                                    updateData.rejectionReason = metaTemplate.rejection_reason || metaTemplate.reason || "Template rejected by Meta";
                                } else {
                                    // Clear rejection reason if approved
                                    updateData.rejectionReason = undefined;
                                }
                                
                                await Template.updateOne({ _id: template._id }, { $set: updateData });
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
        const { name, type, content, link, caption, variables, buttons, category: requestCategory } = body;
        
        // Use provided category or default based on type
        const category = ["MARKETING", "UTILITY"].includes(requestCategory) ? requestCategory : "MARKETING";

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

        // Validate buttons (if provided)
        const allowedPayloads = ["order_confirmation", "cancel_order", "edit_order"]; 
        if (Array.isArray(buttons)) {
            for (const b of buttons) {
                if (!b || !b.type || !b.text) {
                    return NextResponse.json({ error: "Each button requires type and text" }, { status: 400 });
                }
                if (!["QUICK_REPLY", "URL", "PHONE"].includes(b.type)) {
                    return NextResponse.json({ error: "Invalid button type" }, { status: 400 });
                }
                if (b.type === "QUICK_REPLY") {
                    if (!b.payload || !allowedPayloads.includes(b.payload)) {
                        return NextResponse.json({ error: "Invalid QUICK_REPLY payload. Allowed: order_confirmation, cancel_order, edit_order" }, { status: 400 });
                    }
                }
                if (b.type === "URL" && !b.url) {
                    return NextResponse.json({ error: "URL button requires url" }, { status: 400 });
                }
                if (b.type === "PHONE" && !b.phoneNumber) {
                    return NextResponse.json({ error: "PHONE button requires phoneNumber" }, { status: 400 });
                }
            }
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


        const account = await WhatsAppAccount.findOne({ owner: userId });
        if (!account)
            return NextResponse.json({ error: "WhatsApp account not found" }, { status: 404 });

        const rawToken = decryptToken(account.waTokenEncrypted);

        // ------------------------------------------
        // 🔥 STEP 1: Detect Language Automatically
        // ------------------------------------------
        // Meta supported language codes: https://developers.facebook.com/docs/whatsapp/api/messages/message-templates#supported-languages
        function detectLanguage(text: string) {
            if (/[\u0600-\u06FF]/.test(text)) return "ar"; // Arabic
            if (/[éàèçùâêîôûëï]/i.test(text)) return "fr"; // French
            return "en_US"; // English (US)
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
        // 🔥 STEP 4: Upload Media via Resumable Upload API (for media templates)
        // ------------------------------------------
        // Meta requires header_handle from Resumable Upload API for media templates
        // Docs: https://developers.facebook.com/docs/graph-api/guides/upload
        let mediaHandle: string | undefined = undefined;

        if (type !== "TEXT") {
            try {
                // Step 4.1: Download file from Vercel Blob to get its content
                const fileResponse = await fetch(link);
                if (!fileResponse.ok) {
                    throw new Error("Failed to download media file from storage");
                }
                
                const fileBuffer = await fileResponse.arrayBuffer();
                const fileLength = fileBuffer.byteLength;
                const fileName = link.split('/').pop() || 'media';
                
                // Map file type to MIME type
                // Meta only supports: IMAGE (jpeg, jpg, png), VIDEO (mp4), DOCUMENT (pdf)
                const mimeTypeMap: Record<string, string> = {
                    'IMAGE': 'image/png',
                    'VIDEO': 'video/mp4',
                    'DOCUMENT': 'application/pdf'
                };
                
                // Detect MIME from file extension if possible
                const ext = fileName.split('.').pop()?.toLowerCase();
                let fileType = mimeTypeMap[type] || 'image/png';
                if (ext === 'jpg' || ext === 'jpeg') fileType = 'image/jpeg';
                else if (ext === 'png') fileType = 'image/png';
                else if (ext === 'mp4') fileType = 'video/mp4';
                else if (ext === 'pdf') fileType = 'application/pdf';
                
                // Step 4.2: Start upload session
                // POST /<APP_ID>/uploads?file_name=...&file_length=...&file_type=...
                const appId = account.metaAppId;
                if (!appId) {
                    throw new Error("Meta App ID is required for media uploads. Please add it in Settings > WhatsApp.");
                }
                
                const sessionRes = await fetch(
                    `https://graph.facebook.com/v20.0/${appId}/uploads?file_name=${encodeURIComponent(fileName)}&file_length=${fileLength}&file_type=${encodeURIComponent(fileType)}`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${rawToken}`
                        }
                    }
                );
                
                const sessionData = await sessionRes.json();
                console.log("Upload session response:", sessionData);
                
                if (!sessionRes.ok || !sessionData.id) {
                    throw new Error(sessionData.error?.message || "Failed to start upload session");
                }
                
                const uploadSessionId = sessionData.id; // "upload:<SESSION_ID>"
                
                // Step 4.3: Upload the file binary
                // POST /upload:<SESSION_ID> with binary data
                const uploadRes = await fetch(
                    `https://graph.facebook.com/v20.0/${uploadSessionId}`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `OAuth ${rawToken}`,
                            file_offset: "0"
                        },
                        body: Buffer.from(fileBuffer)
                    }
                );
                
                const uploadData = await uploadRes.json();
                
                if (!uploadRes.ok || !uploadData.h) {
                    throw new Error(uploadData.error?.message || "Failed to upload file");
                }
                
                // Meta returns the handle in uploadData.h
                // Clean the handle: remove any newlines, carriage returns, or extra whitespace
                const rawHandle = String(uploadData.h);
                // Split by newline and take only the first handle, then clean it
                const firstHandle = rawHandle.split(/[\r\n]+/)[0];
                mediaHandle = firstHandle.replace(/\s+/g, '').trim();
            } catch (err: any) {
                console.error("Media upload error:", err);
                throw new Error(err.message || "Failed to upload media to Meta");
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
            // Media templates: HEADER + BODY
            // Meta supports: IMAGE, VIDEO, DOCUMENT for template headers
            const format = type;

            // Verify we have media handle from Resumable Upload
            if (!mediaHandle) {
                throw new Error("Media upload failed - cannot create template without media handle");
            }

            // Use header_handle from Resumable Upload API
            components.push({
                type: "HEADER",
                format,
                example: { header_handle: [mediaHandle] }
            });

            // BODY component is REQUIRED for media templates by Meta
            // Use caption if provided, otherwise use a minimal placeholder text
            // Note: Meta rejects empty or whitespace-only body text
            const bodyText = (caption && caption.trim()) ? caption.trim() : "Check out this content!";
            const bodyComponent: any = {
                type: "BODY",
                text: bodyText
            };
            
            // Only add example if there are variables
            if (exampleValues.length > 0) {
                bodyComponent.example = { body_text: [exampleValues] };
            }
            
            components.push(bodyComponent);
        }

        // Append BUTTONS component if buttons provided
        if (Array.isArray(buttons) && buttons.length > 0) {
            const urlExamples: string[][] = [];
            const buttonItems = buttons
                .map((b: any) => {
                    if (b.type === "QUICK_REPLY") {
                        return { type: "QUICK_REPLY", text: b.text };
                    }
                    if (b.type === "URL") {
                        const item: any = { type: "URL", text: b.text, url: b.url };
                        const placeholderCount = (b.url?.match(/{{\d+}}/g) || []).length;
                        if (placeholderCount > 0) {
                            urlExamples.push(Array(placeholderCount).fill("12345"));
                        }
                        return item;
                    }
                    if (b.type === "PHONE") {
                        return { type: "PHONE_NUMBER", text: b.text, phone_number: b.phoneNumber };
                    }
                    return null;
                })
                .filter(Boolean);

            if (buttonItems.length > 0) {
                const buttonsComponent: any = { type: "BUTTONS", buttons: buttonItems };
                if (urlExamples.length > 0) {
                    buttonsComponent.example = { button_url: urlExamples };
                }
                components.push(buttonsComponent);
            }
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

        // ------------------------------------------
        // 🔥 AUDIO templates: Store locally only (Meta doesn't support audio in templates)
        // ------------------------------------------
        if (type === "AUDIO") {
            const newTemplate = await Template.create({
                owner: userId,
                name: name.trim(),
                metaName,
                type,
                content,
                link,
                caption,
                variables,
                buttons,
                status: "AUDIO", // Special status for audio templates
                category,
                language
            });
            
            return NextResponse.json({ template: newTemplate });
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
            buttons,
            status: "PENDING",
            category,
            language
        });

        // ------------------------------------------
        // 🔥 STEP 7: SEND TEMPLATE TO META
        // ------------------------------------------
        const templatePayload = {
            name: metaName,
            language,
            category,
            components
        };
        
        const metaRes = await fetch(
            `https://graph.facebook.com/v20.0/${account.waBusinessId}/message_templates`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${rawToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(templatePayload)
            }
        );

        const metaData = await metaRes.json();
        console.log("Meta template creation response:", metaData);

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
        const { id, name, type, content, link, caption, variables, buttons } = await req.json();

        if (!id || !name?.trim()) {
        return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
        }

        const template = await Template.findOne({ _id: id, owner: userId });
        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }
        // Validate buttons (if provided)
        const allowedPayloads = ["order_confirmation", "cancel_order", "edit_order"]; 
        if (Array.isArray(buttons)) {
            for (const b of buttons) {
                if (!b || !b.type || !b.text) {
                    return NextResponse.json({ error: "Each button requires type and text" }, { status: 400 });
                }
                if (!["QUICK_REPLY", "URL", "PHONE"].includes(b.type)) {
                    return NextResponse.json({ error: "Invalid button type" }, { status: 400 });
                }
                if (b.type === "QUICK_REPLY") {
                    if (!b.payload || !allowedPayloads.includes(b.payload)) {
                        return NextResponse.json({ error: "Invalid QUICK_REPLY payload. Allowed: order_confirmation, cancel_order, edit_order" }, { status: 400 });
                    }
                }
                if (b.type === "URL" && !b.url) {
                    return NextResponse.json({ error: "URL button requires url" }, { status: 400 });
                }
                if (b.type === "PHONE" && !b.phoneNumber) {
                    return NextResponse.json({ error: "PHONE button requires phoneNumber" }, { status: 400 });
                }
            }
        }

        // Update fields safely (do NOT change category)
        template.name = name.trim();
        template.type = type || template.type;
        template.content = content?.trim();
        template.link = link?.trim();
        template.caption = caption?.trim();
        template.variables = variables || [];
        template.buttons = Array.isArray(buttons) ? buttons : [];
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

            // Append BUTTONS component if buttons provided
            if (Array.isArray(buttons) && buttons.length > 0) {
                const urlExamples: string[][] = [];
                const buttonItems = buttons
                    .map((b: any) => {
                        if (b.type === "QUICK_REPLY") {
                            return { type: "QUICK_REPLY", text: b.text };
                        }
                        if (b.type === "URL") {
                            const item: any = { type: "URL", text: b.text, url: b.url };
                            const placeholderCount = (b.url?.match(/{{\d+}}/g) || []).length;
                            if (placeholderCount > 0) {
                                urlExamples.push(Array(placeholderCount).fill("12345"));
                            }
                            return item;
                        }
                        if (b.type === "PHONE") {
                            return { type: "PHONE_NUMBER", text: b.text, phone_number: b.phoneNumber };
                        }
                        return null;
                    })
                    .filter(Boolean);

                if (buttonItems.length > 0) {
                    const buttonsComponent: any = { type: "BUTTONS", buttons: buttonItems };
                    if (urlExamples.length > 0) {
                        buttonsComponent.example = { button_url: urlExamples };
                    }
                    components.push(buttonsComponent);
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

        // Delete media file if exists (for IMAGE, VIDEO, AUDIO, DOCUMENT templates)
        if (template.link && template.type !== "TEXT") {
            try {
                // Verify the file belongs to this user before deleting
                if (template.link.includes(`/uploads/${userId}/`)) {
                    await del(template.link);
                    console.log(`Deleted media file: ${template.link}`);
                }
            } catch (err) {
                console.warn("Failed to delete media file:", err);
                // Continue with template deletion even if media deletion fails
            }
        }

        // If template is REJECTED or AUDIO, delete directly from DB without checking Meta
        if (template.status === "REJECTED" || template.status === "AUDIO") {
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

