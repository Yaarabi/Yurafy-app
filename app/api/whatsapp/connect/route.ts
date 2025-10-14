

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/whatsappAccount";

export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Simulate connection logic
    const account = await WhatsAppAccount.findOneAndUpdate(
        { owner: session.user.id },
        { verified: true },
        { new: true }
    );

    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    return NextResponse.json({ success: true });
}
