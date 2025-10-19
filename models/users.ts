import mongoose from "mongoose";

export interface IUser {
    _id: string;
    name: string;
    brandName?: string;
    logo?: string;
    email: string;
    phone?: string;
    plan: 
        | "Starter" 
        | "WhatsApp Automation" 
        | "AI WhatsApp Agent" 
        | "Creator" 
        | "Pro Seller" 
        | "Visionary" 
        | "free";
    role: "user" | "tester" | "admin";
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brandName: {
        type: String,
        lowercase: true,
        trim: true,
        default: null
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
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false,
        trim: true
    },
    plan: {
        type: String,
        enum: [
            "Starter",
            "WhatsApp Automation",
            "AI WhatsApp Agent",
            "Creator",
            "Pro Seller",
            "Visionary",
            "free"
        ],
        default: "free"
    },
    role: {
        type: String,
        enum: ["user", "tester", "admin"],
        default: "user"
    }
});

userSchema.index({ brandName: 1 }, { unique: true, sparse: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
