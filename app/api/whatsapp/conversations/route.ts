import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppConversation from "@/models/whatsappMessage";
import { decryptMessage } from "@/lib/whatsapp/messageEncryption";
import { normalizePhoneNumber } from "@/lib/whatsapp/phoneNormalize";

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

        // Decrypt messages before sending to client
        const decryptedConversations = conversations.map(conv => {
            const decryptedMessages = conv.messages.map((msg: any) => ({
                ...msg.toObject(),
                text: msg.text ? decryptMessage(msg.text) : msg.text,
            }));
            
            return {
                ...conv.toObject(),
                messages: decryptedMessages,
                lastMessage: conv.lastMessage ? decryptMessage(conv.lastMessage) : conv.lastMessage,
            };
        });

        return NextResponse.json({ conversations: decryptedConversations });
    } catch (err) {
        console.error("GET /messages error:", err);
        return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
    }
}

// ✅ Send a new outgoing message (keep latest 10 messages)
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { phone, message } = await req.json();
        if (!phone || !message)
            return NextResponse.json({ error: "Missing phone or message" }, { status: 400 });

        // Normalize phone number for consistent database queries
        const normalizedPhone = normalizePhoneNumber(phone);

        // ✅ FIXED: Check contact limit before creating new conversation (using transaction)
        const mongoose = (await import('mongoose')).default;
        const mongoSession = await mongoose.startSession();
        
        let conversation;
        try {
            await mongoSession.withTransaction(async () => {
                // Check if conversation already exists (creating new contact)
                const existingConversation = await WhatsAppConversation.findOne({
                    owner: session.user.id,
                    "customer.phone": normalizedPhone
                }).session(mongoSession);

                // Only check limit if this is a NEW contact (conversation doesn't exist)
                if (!existingConversation) {
                    const { canPerformAction } = await import('@/lib/utils/planLimits');
                    const canAddContact = await canPerformAction(session.user.id, 'add_contact', mongoSession);
                    if (!canAddContact.allowed) {
                        throw new Error(canAddContact.reason || "Contact limit reached");
                    }
                }

                // Encrypt message text before saving
                const { encryptMessage } = await import("@/lib/whatsapp/messageEncryption");
                const encryptedText = message.text ? encryptMessage(message.text) : "";
                
                const newMessage = {
                    ...message,
                    text: encryptedText, // Store encrypted
                    direction: "outgoing",
                    timestamp: Date.now(),
                };

                // Push new message and keep only latest 12 messages
                // Use normalized phone number to ensure all messages go to the same conversation
                conversation = await WhatsAppConversation.findOneAndUpdate(
                    { owner: session.user.id, "customer.phone": normalizedPhone },
                    {
                        $push: { messages: { $each: [newMessage], $slice: -12 } },
                        $set: {
                            lastMessage: encryptedText, // Store encrypted
                            lastTimestamp: newMessage.timestamp,
                            "customer.phone": normalizedPhone, // Ensure phone is normalized
                        },
                    },
                    { upsert: true, new: true, session: mongoSession }
                );
            });
        } catch (error: any) {
            await mongoSession.endSession();
            if (error.message?.includes('limit') || error.message?.includes('plan')) {
                return NextResponse.json({ 
                    error: error.message || "Contact limit reached" 
                }, { status: 403 });
            }
            throw error;
        } finally {
            await mongoSession.endSession();
        }

        if (!conversation) {
            return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
        }

        // Decrypt before returning
        const decryptedConversation = {
            ...conversation.toObject(),
            messages: conversation.messages.map((msg: any) => ({
                ...msg.toObject(),
                text: msg.text ? decryptMessage(msg.text) : msg.text,
            })),
            lastMessage: conversation.lastMessage ? decryptMessage(conversation.lastMessage) : conversation.lastMessage,
        };

        return NextResponse.json({ success: true, conversation: decryptedConversation });
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

        // Normalize phone number to E.164 format
        const normalizedPhone = normalizePhoneNumber(phone);

        const conversation = await WhatsAppConversation.findOneAndUpdate(
            { owner: session.user.id, "customer.phone": normalizedPhone },
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

// ✅ Update contact name
export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(req.url);
        const convId = url.pathname.split("/").pop(); // /api/.../:id
        if (!convId) return NextResponse.json({ error: "Missing conversation ID" }, { status: 400 });

        const { name } = await req.json();
        if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        const conversation = await WhatsAppConversation.findOneAndUpdate(
            { _id: convId, owner: session.user.id },
            { $set: { "customer.name": name } },
            { new: true }
        );

        if (!conversation)
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

        return NextResponse.json({ success: true, conversation });
    } catch (err) {
        console.error("PATCH /messages error:", err);
        return NextResponse.json({ error: "Failed to update contact name" }, { status: 500 });
    }
}
