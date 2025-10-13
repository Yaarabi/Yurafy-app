
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/whatsappAccount";

export async function GET(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const account = await WhatsAppAccount.findOne({ owner: session.user.id });
    if (!account) return NextResponse.json({ error: "No account found" }, { status: 404 });

    return NextResponse.json({
        enabled: account.botEnabled || false,
        template: account.botTemplate || "",
    });
}

export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { enabled, template } = await req.json();
    const account = await WhatsAppAccount.findOneAndUpdate(
        { owner: session.user.id },
        { botEnabled: enabled, botTemplate: template },
        { new: true }
    );

    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    return NextResponse.json({ success: true });
}
