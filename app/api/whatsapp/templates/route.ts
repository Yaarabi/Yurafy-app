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

        const account = await WhatsAppAccount.findOne({ owner: userId });
        if (!account) return NextResponse.json({ error: "WhatsApp account not found" }, { status: 404 });

        const templates = await Template.find({ owner: userId }).sort({ createdAt: -1 });

        // Optional: refresh pending templates from Meta
        const rawToken = decryptToken(account.waTokenEncrypted);
        for (const template of templates) {
            if (template.status === "PENDING") {
                try {
                    const nameSlug = template.name.trim().toLowerCase().replace(/\s+/g, "_");
                    const res = await fetch(
                        `https://graph.facebook.com/v20.0/${account.waBusinessId}/message_templates?name=${nameSlug}`,
                        { headers: { Authorization: `Bearer ${rawToken}` } }
                    );
                    const metaData = await res.json();
                    if (metaData.data?.length > 0) {
                        const metaTemplate = metaData.data[0];
                        template.status = metaTemplate.status || "PENDING";
                        template.rejectionReason =
                            metaTemplate.status === "REJECTED" ? metaTemplate.rejection_reason : undefined;
                        await template.save();
                    }
                } catch (err) {
                    console.error("Meta fetch error:", err);
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
        const { name, type, content, mediaUrl, caption, variables } = await req.json();

        if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
        if (type === "TEXT" && !content?.trim())
            return NextResponse.json({ error: "Content is required for TEXT type" }, { status: 400 });
        if (type !== "TEXT" && !mediaUrl?.trim())
            return NextResponse.json({ error: "Media URL is required for media templates" }, { status: 400 });

        const account = await WhatsAppAccount.findOne({ owner: userId });
        if (!account) return NextResponse.json({ error: "WhatsApp account not found" }, { status: 404 });

        const rawToken = decryptToken(account.waTokenEncrypted);

        const newTemplate = await Template.create({
            owner: userId,
            name: name.trim(),
            type,
            content: content?.trim(),
            mediaUrl: mediaUrl?.trim(),
            caption: caption?.trim(),
            variables: variables || [],
            status: "PENDING",
        });

        // Build components
        const components: any[] = [];
        if (type === "TEXT") components.push({ type: "BODY", text: content });
        else components.push({ type, [type.toLowerCase() + "_url"]: mediaUrl, caption });

        // Send to Meta
        try {
            const res = await fetch(
                `https://graph.facebook.com/v20.0/${account.waBusinessId}/message_templates`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${rawToken}`, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name.trim().toLowerCase().replace(/\s+/g, "_"),
                        category: "UTILITY",
                        language: "en_US",
                        components,
                    }),
                }
            );
            const metaData = await res.json();
            if (metaData.error) {
                newTemplate.status = "REJECTED";
                newTemplate.rejectionReason = metaData.error.message;
            } else {
                newTemplate.status = metaData.status || "PENDING";
            }
            await newTemplate.save();
        } catch (err) {
            console.error("Meta template creation failed:", err);
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
        const { id, name, type, content, mediaUrl, caption, variables } = await req.json();
        if (!id || !name?.trim())
            return NextResponse.json({ error: "ID and name are required" }, { status: 400 });

        const template = await Template.findOne({ _id: id, owner: userId });
        if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

        // Update fields safely
        template.name = name.trim();
        template.type = type || template.type;
        template.content = content?.trim();
        template.mediaUrl = mediaUrl?.trim();
        template.caption = caption?.trim();
        template.variables = variables || [];
        template.status = "PENDING";
        template.rejectionReason = undefined;

        const account = await WhatsAppAccount.findOne({ owner: userId });
        if (account) {
            const rawToken = decryptToken(account.waTokenEncrypted);
            const components: any[] = [];
            if (type === "TEXT") components.push({ type: "BODY", text: content });
            else components.push({ type, [type.toLowerCase() + "_url"]: mediaUrl, caption });

            try {
                const res = await fetch(
                    `https://graph.facebook.com/v20.0/${account.waBusinessId}/message_templates`,
                    {
                        method: "POST",
                        headers: { Authorization: `Bearer ${rawToken}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: name.trim().toLowerCase().replace(/\s+/g, "_"),
                            category: "UTILITY",
                            language: "en_US",
                            components,
                        }),
                    }
                );
                const metaData = await res.json();
                if (metaData.error) {
                    template.status = "REJECTED";
                    template.rejectionReason = metaData.error.message;
                } else {
                    template.status = metaData.status || "PENDING";
                }
            } catch (err) {
                console.error("Meta update failed:", err);
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
