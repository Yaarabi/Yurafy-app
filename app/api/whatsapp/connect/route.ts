import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/automation/whatsappAccount";

export async function PUT(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure WhatsApp feature is allowed for this user
    const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
    const check = await ensureFeatureEnabled(session.user.id, 'whatsapp');
    if (check) return check;

    try {
        const { status } = await req.json();
        if (!["connected", "disconnected"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const account = await WhatsAppAccount.findOne({ owner: session.user.id });
        if (!account) {
        return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        if (status === "connected") {
        account.status = "connected";
        account.verified = true;
        account.settings = {
            ...account.settings,
            autoReply: true,
            orderConfirmation: true,
        };
        } else {
        account.status = "disconnected";
        account.verified = false;
        account.settings = {
            ...account.settings,
            autoReply: false,
            orderConfirmation: false,
            aiAgent: false,
        };
        }

        await account.save();

        return NextResponse.json({
        success: true,
        message:
            status === "connected"
            ? "WhatsApp connected successfully"
            : "WhatsApp disconnected successfully",
        account,
        });
    } catch (err) {
        console.error("Error updating WhatsApp status:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
