import mongoose, { Schema } from "mongoose";

export interface IWhatsAppMessage {
    waMessageId?: string;
    from: string;
    to: string;
    type: "text" | "image" | "document" | "audio" | "video" | "location" | "unknown";
    text?: string;
    mediaUrl?: string;
    direction: "incoming" | "outgoing";
    status: "sent" | "delivered" | "read" | "failed";
    isAIResponse?: boolean;
    timestamp: number;
}

export interface IWhatsAppConversation {
    _id: string;
    owner: string;
    customer: {
        name?: string;
        phone: string;
    };
    messages: IWhatsAppMessage[];
    lastMessage?: string;
    lastTimestamp?: number;
    unreadCount?: number;
    status: "open" | "closed" | "human_required";
    aiEnabled?: boolean;
    optInStatus?: "opted_in" | "opted_out" | "unknown"; // User consent for promotional messages
    optInDate?: Date; // When user opted in
    optOutDate?: Date; // When user opted out
    metadata?: {
        escalationReason?: string;
        escalatedAt?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const WhatsAppMessageSchema = new Schema<IWhatsAppMessage>(
    {
        waMessageId: String,
        from: String,
        to: String,
        type: {
            type: String,
            enum: ["text", "image", "document", "audio", "video", "location", "unknown"],
            default: "text",
        },
        text: String,
        mediaUrl: String,
        direction: {
            type: String,
            enum: ["incoming", "outgoing"],
            required: true,
        },
        status: {
            type: String,
            enum: ["sent", "delivered", "read", "failed"],
            default: "sent",
        },
        isAIResponse: { type: Boolean, default: false },
        timestamp: { type: Number, required: true },
    },
);

const WhatsAppConversationSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        customer: {
            name: String,
            phone: { type: String, required: true },
            profilePic: String,
        },
        messages: [WhatsAppMessageSchema],
        lastMessage: String,
        lastTimestamp: Number,
        unreadCount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["open", "closed", "human_required"],
            default: "open",
        },
        metadata: {
            escalationReason: String,
            escalatedAt: Date,
        },
        aiEnabled: { type: Boolean, default: false },
        optInStatus: {
            type: String,
            enum: ["opted_in", "opted_out", "unknown"],
            default: "unknown",
        },
        optInDate: Date,
        optOutDate: Date,
    },
    { timestamps: true }
);

export default mongoose.models.WhatsAppConversation || mongoose.model("WhatsAppConversation", WhatsAppConversationSchema);
