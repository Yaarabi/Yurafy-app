import mongoose from "mongoose";

export interface IUser {
    _id: string;
    username: string;
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
    active: boolean;
}

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
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
    },
    active: {
        type: Boolean,
        default: false,
    }
});

export default mongoose.models.User || mongoose.model("User", userSchema);
