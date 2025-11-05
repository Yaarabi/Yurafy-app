
import mongoose from "mongoose";

export interface IPlan {
    _id: string;
    userId: string;
    planKey: string; // Changed from enum to string to support custom plans
    price: number;
    durationDays: number;
    startDate: Date;
    endDate: Date;
    status: "active" | "expired" | "cancelled";
    // Idempotency tracking for payment verification
    paymentOrderId?: string; // PayPal order ID - for idempotency
    paymentProcessedAt?: Date; // When payment was processed
    // Transaction tracking
    transactionId?: string; // Unique transaction ID for rollback/retry
}

const planSchema = new mongoose.Schema(
    {
        userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
        },
        planKey: {
        type: String,
        required: true,
        index: true,
        // Removed enum to support custom plans
        },
        price: {
        type: Number,
        required: true,
        min: 0,
        },
        durationDays: {
        type: Number,
        required: true,
        min: 1,
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
        index: true,
        },
        paymentOrderId: {
        type: String,
        unique: true,
        sparse: true, // Only index when present
        index: true,
        },
        paymentProcessedAt: {
        type: Date,
        },
        transactionId: {
        type: String,
        index: true,
        },
    },
    { timestamps: true }
);

// Compound index for active user plans
planSchema.index({ userId: 1, status: 1 });

export default mongoose.models.Plan || mongoose.model("Plan", planSchema);
