import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/whatsappAccount";

export async function GET(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure WhatsApp feature is allowed for this user
    const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
    const check = await ensureFeatureEnabled(session.user.id, 'whatsapp');
    if (check) return check;

    const account = await WhatsAppAccount.findOne({ owner: session.user.id });
    if (!account)
        return NextResponse.json({ error: "No account found" }, { status: 404 });

    return NextResponse.json({
        status: account.status,
        settings: account.settings,
        templates: account.templates,
        aiConfig: account.aiConfig,
    });
}

export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure WhatsApp feature is allowed for this user
    const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
    const check = await ensureFeatureEnabled(session.user.id, 'whatsapp');
    if (check) return check;

    const data = await req.json();

    const account = await WhatsAppAccount.findOne({ owner: session.user.id });
    if (!account)
        return NextResponse.json({ error: "Account not found" }, { status: 404 });

    if (account.status !== "connected") {
        return NextResponse.json({ error: "Account not connected" }, { status: 400 });
    }

    // Update supported fields
    if (data.settings) account.settings = { ...account.settings, ...data.settings };
    if (data.templates) account.templates = { ...account.templates, ...data.templates };
    if (data.aiConfig) account.aiConfig = { ...account.aiConfig, ...data.aiConfig };

    await account.save();

    return NextResponse.json({ success: true, account });
}
