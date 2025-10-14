

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/whatsappAccount";
import { decryptToken } from "../webhook/route";
import { sendWhatsAppMessage } from "@/lib/whatsapp/sendMessage";

export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message } = await req.json();
    const account = await WhatsAppAccount.findOne({ owner: session.user.id });
    if (!account || !account.verified) return NextResponse.json({ error: "Account not connected" }, { status: 404 });

    const decryptedToken = decryptToken(account.waTokenEncrypted);
    await sendWhatsAppMessage(account, account.waNumber, message, decryptedToken);

    return NextResponse.json({ success: true });
}
