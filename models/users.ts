import mongoose from "mongoose";

export interface IUser {
    _id: string;
    username: string;
    email: string;
    phone?: string;
    role: "user" | "admin";
    active: boolean;
    currentPlanId?: string;
    onboardingCompleted?: boolean;
    tokensConsumed?: number;
}

const userSchema = new mongoose.Schema(
    {
        username: {
        type: String,
        required: true,
        trim: true,
        index: true, // Index for faster lookups
        },
        email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true, // Index for faster lookups
        },
        password: {
        type: String,
        required: true,
        select: false, // Don't return password by default
        },
        phone: {
        type: String,
        required: false,
        trim: true,
        },
        role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        index: true, // Index for role-based queries
        },
        active: {
        type: Boolean,
        default: false,
        index: true, // Index for filtering active users
        },
        currentPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        default: null,
        index: true, // Index for plan lookups
        },
        onboardingCompleted: {
        type: Boolean,
        default: false,
        },
        emailVerified: {
        type: Boolean,
        default: false,
        },
        emailVerificationToken: {
        type: String,
        default: null,
        },
        passwordResetToken: {
        type: String,
        default: null,
        },
        passwordResetExpires: {
        type: Date,
        default: null,
        },
        tokensConsumed: {
        type: Number,
        default: 0,
        index: true, // Index for statistics queries
        },
    },
    { timestamps: true }
);

// Compound indexes for common queries
userSchema.index({ email: 1, active: 1 });
userSchema.index({ role: 1, active: 1 });

export default mongoose.models.User || mongoose.model("User", userSchema);
