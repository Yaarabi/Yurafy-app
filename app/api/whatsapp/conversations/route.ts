import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppConversation from "@/models/whatsappMessage";

// ✅ Get all conversations for the logged-in owner
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Fetch all conversations for this owner
        const conversations = await WhatsAppConversation.find({ owner: session.user.id })
        .sort({ lastTimestamp: -1 }); // latest first

        return NextResponse.json({ conversations });
    } catch (err) {
        console.error("GET /messages error:", err);
        return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
    }
}

// ✅ Send a new outgoing message
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { phone, message } = await req.json();
        if (!phone || !message)
        return NextResponse.json({ error: "Missing phone or message" }, { status: 400 });

        const newMessage = {
        ...message,
        direction: "outgoing",
        timestamp: Date.now(),
        };

        const conversation = await WhatsAppConversation.findOneAndUpdate(
        { owner: session.user.id, "customer.phone": phone },
        {
            $push: { messages: newMessage },
            $set: {
            lastMessage: message.text || "",
            lastTimestamp: newMessage.timestamp,
            "customer.phone": phone,
            },
        },
        { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, conversation });
    } catch (err) {
        console.error("POST /messages error:", err);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}

// ✅ Delete a specific message
export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(req.url);
        const phone = url.searchParams.get("phone");
        const messageId = url.searchParams.get("waMessageId");

        if (!phone || !messageId)
        return NextResponse.json({ error: "Missing phone or message ID" }, { status: 400 });

        const conversation = await WhatsAppConversation.findOneAndUpdate(
        { owner: session.user.id, "customer.phone": phone },
        { $pull: { messages: { waMessageId: messageId } } },
        { new: true }
        );

        if (!conversation)
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

        return NextResponse.json({ success: true, conversation });
    } catch (err) {
        console.error("DELETE /messages error:", err);
        return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
    }
}
