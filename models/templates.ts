import mongoose, { Schema } from "mongoose";

export interface ITemplate {
    _id: string;
    owner: mongoose.Types.ObjectId;
    name: string;
    metaName: string;
    type: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";
    category: "UTILITY" | "MARKETING";
    content?: string; // for TEXT templates
    variables?: string[]; // e.g. ["customerName", "orderId"]
    link?: string; // for media templates
    caption?: string; // optional caption for media
    buttons?: Array<{
        type: "QUICK_REPLY" | "URL" | "PHONE";
        text: string;
        payload?: "order_confirmation" | "cancel_order" | "edit_order";
        url?: string;
        phoneNumber?: string;
    }>;
    status: "PENDING" | "APPROVED" | "REJECTED";
    languageCode?: string;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TemplateSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true, unique: true },
        metaName: { type: String, required: true, unique: true },
        type: {
            type: String,
            enum: ["TEXT", "IMAGE", "AUDIO", "VIDEO", "DOCUMENT"],
            default: "TEXT",
        },
        category: {
            type: String,
            enum: ["UTILITY", "MARKETING"],
            required: true,
        },
        languageCode: { type: String, default: "en_US" },
        content: { type: String }, 
        variables: [{ type: String }],
        link: { type: String }, 
        caption: { type: String },
        buttons: [
            {
                type: new Schema(
                    {
                        type: { type: String, enum: ["QUICK_REPLY", "URL", "PHONE"], required: true },
                        text: { type: String, required: true },
                        payload: { type: String, enum: ["order_confirmation", "cancel_order", "edit_order"] },
                        url: { type: String },
                        phoneNumber: { type: String },
                    },
                    { _id: false }
                ),
            },
        ],
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
