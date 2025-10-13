import mongoose, { Schema } from "mongoose";

export interface IWhatsAppMessage {
    owner: string;
    from: string;
    to: string;
    type: string;
    text?: string;
    mediaUrl?: string;
    timestamp: number;
    direction: "incoming" | "outgoing";
}

const WhatsAppMessageSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        from: String,
        to: String,
        type: String,
        text: String,
        mediaUrl: String,
        timestamp: Number,
        direction: { type: String, enum: ["incoming", "outgoing"], required: true },
    },
    { timestamps: true }
);

export default mongoose.models.WhatsAppMessage || mongoose.model("WhatsAppMessage", WhatsAppMessageSchema);
