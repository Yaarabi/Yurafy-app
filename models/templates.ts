
import mongoose, { Schema, Document } from "mongoose";

export interface ITemplate extends Document {
    owner: mongoose.Types.ObjectId; // user or WhatsAppAccount ID
    name: string;
    content: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TemplateSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        content: { type: String, required: true },
        status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
        },
        rejectionReason: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.Template || mongoose.model("Template", TemplateSchema);
