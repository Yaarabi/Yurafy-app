import mongoose, { Schema } from "mongoose";

export interface ITemplate {
    _id: string;
    owner: mongoose.Types.ObjectId;
    name: string;
    type: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";
    content?: string; // for TEXT templates
    variables?: string[]; // e.g. ["customerName", "orderId"]
    link?: string; // for media templates
    caption?: string; // optional caption for media
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TemplateSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ["TEXT", "IMAGE", "AUDIO", "VIDEO", "DOCUMENT"],
            default: "TEXT",
        },
        content: { type: String }, 
        variables: [{ type: String }],
        link: { type: String }, 
        caption: { type: String },
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
