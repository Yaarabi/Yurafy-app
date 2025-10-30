import mongoose from "mongoose";

export interface IUser {
    _id: string;
    username: string;
    logo?: string;
    email: string;
    phone?: string;
    role: "user" | "tester" | "admin";
    active: boolean;
    currentPlanId?: string;
    onboardingCompleted?: boolean;
}

const userSchema = new mongoose.Schema(
    {
        username: {
        type: String,
        required: true,
        trim: true,
        },
        logo: {
        type: String,
        required: false,
        },
        email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        },
        password: {
        type: String,
        required: true,
        },
        phone: {
        type: String,
        required: false,
        trim: true,
        },
        role: {
        type: String,
        enum: ["user", "tester", "admin"],
        default: "user",
        },
        active: {
        type: Boolean,
        default: false,
        },
        currentPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        default: null,
        },
        onboardingCompleted: {
        type: Boolean,
        default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
