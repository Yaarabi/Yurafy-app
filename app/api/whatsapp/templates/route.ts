import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Template from "@/models/templates";
import WhatsAppAccount from "@/models/whatsappAccount";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth"; 
import { decryptToken } from "../webhook/route"; 

// Helper to get current user ID from session
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

        // Only update templates that are still pending
        for (const template of templates) {
            if (template.status === "PENDING") {
                try {
                    const nameSlug = template.name.trim().toLowerCase().replace(/\s+/g, "_");
                    const res = await fetch(`https://graph.facebook.com/v20.0/${account.waBusinessId}/message_templates?name=${nameSlug}`, {
                        headers: { Authorization: `Bearer ${account.waTokenEncrypted}` },
                    });
                    const metaData = await res.json();

                    if (metaData.data && metaData.data.length > 0) {
                        const metaTemplate = metaData.data[0];
                        template.status = metaTemplate.status || "PENDING";
                        template.rejectionReason = metaTemplate.status === "REJECTED" ? metaTemplate.rejection_reason : undefined;
                        await template.save();
                    }
                } catch (metaErr) {
                    console.error("Failed to fetch template status from Meta:", metaErr);
                }
            }
        }

        return NextResponse.json({ templates });
    } catch (err: any) {
        console.error("GET /templates error:", err);
        const status = err.message === "Unauthorized" ? 401 : 500;
        return NextResponse.json({ error: err.message || "Server error" }, { status });
    }
}



// ------------------------
// POST: create new template
// ------------------------
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const userId = await getUserId(req);
        const { name, content } = await req.json();

        if (!name?.trim() || !content?.trim()) {
            return NextResponse.json({ error: "Name and content required" }, { status: 400 });
        }

        // Find WhatsApp account
        const account = await WhatsAppAccount.findOne({ owner: userId });
        if (!account) return NextResponse.json({ error: "WhatsApp account not found" }, { status: 404 });

        // Decrypt token
        const rawToken = decryptToken(account.waTokenEncrypted);

        // Create template locally
        const newTemplate = await Template.create({
            owner: userId,
            name: name.trim(),
            content: content.trim(),
            status: "PENDING",
        });

        // Send to Meta API
        const res = await fetch(`https://graph.facebook.com/v20.0/${account.waBusinessId}/message_templates`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${rawToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name.trim().toLowerCase().replace(/\s+/g, "_"),
                category: "UTILITY",
                language: "en_US",
                components: [{ type: "BODY", text: content.trim() }],
            }),
        });

        const metaData = await res.json();
        if (metaData.error) {
            newTemplate.status = "REJECTED";
            newTemplate.rejectionReason = metaData.error.message;
        } else {
            newTemplate.status = metaData.status || "PENDING";
        }
        await newTemplate.save();

        return NextResponse.json({ template: newTemplate });
    } catch (err: any) {
        console.error("POST /templates error:", err);
        const status = err.message === "Unauthorized" ? 401 : 500;
        return NextResponse.json({ error: err.message || "Server error" }, { status });
    }
}

// ------------------------
// PUT: update existing template
// ------------------------
export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const userId = await getUserId(req);
        const { id, name, content } = await req.json();

        if (!id || !name?.trim() || !content?.trim()) {
            return NextResponse.json({ error: "ID, name and content required" }, { status: 400 });
        }

        const template = await Template.findOne({ _id: id, owner: userId });
        if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

        template.name = name.trim();
        template.content = content.trim();
        template.status = "PENDING";
        template.rejectionReason = undefined;

        // Send updated template to Meta
        const account = await WhatsAppAccount.findOne({ owner: userId });
        if (account) {
            const rawToken = decryptToken(account.waTokenEncrypted);
            try {
                const res = await fetch(`https://graph.facebook.com/v20.0/${account.waBusinessId}/message_templates`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${rawToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name.trim().toLowerCase().replace(/\s+/g, "_"),
                        category: "UTILITY",
                        language: "en_US",
                        components: [{ type: "BODY", text: content.trim() }],
                    }),
                });
                const metaData = await res.json();
                if (metaData.error) {
                    template.status = "REJECTED";
                    template.rejectionReason = metaData.error.message;
                } else {
                    template.status = metaData.status || "PENDING";
                }
            } catch (metaErr) {
                console.error("Meta update failed:", metaErr);
            }
        }

        await template.save();
        return NextResponse.json({ template });
    } catch (err: any) {
        console.error("PUT /templates error:", err);
        const status = err.message === "Unauthorized" ? 401 : 500;
        return NextResponse.json({ error: err.message || "Server error" }, { status });
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
        return NextResponse.json({ error: err.message || "Server error" }, { status });
    }
}
