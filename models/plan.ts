
import mongoose from "mongoose";

export interface IPlan {
    _id: string;
    userId: string;
    planKey:
        | "Starter"
        | "WhatsApp Automation"
        | "AI WhatsApp Agent"
        | "Pro Seller"
        | "Visionary"
        | "free";
    price: number;
    durationDays: number;
    startDate: Date;
    endDate: Date;
    status: "active" | "expired" | "cancelled";
}

const planSchema = new mongoose.Schema(
    {
        userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        },
        planKey: {
        type: String,
        enum: [
            "Starter",
            "WhatsApp Automation",
            "AI WhatsApp Agent",
            "Pro Seller",
            "Visionary",
            "free",
        ],
        required: true,
        },
        price: {
        type: Number,
        required: true,
        },
        durationDays: {
        type: Number,
        required: true,
        },
        startDate: {
        type: Date,
        required: true,
        },
        endDate: {
        type: Date,
        required: true,
        },
        status: {
        type: String,
        enum: ["active", "expired", "cancelled"],
        default: "active",
        },
    },
    { timestamps: true }
);

export default mongoose.models.Plan || mongoose.model("Plan", planSchema);
