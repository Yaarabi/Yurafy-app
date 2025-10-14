

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppMessage from "@/models/whatsappMessage";

export async function GET(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const messages = await WhatsAppMessage.find({ owner: session.user.id }).sort({ timestamp: -1 }).limit(50);
    return NextResponse.json(messages);
}
