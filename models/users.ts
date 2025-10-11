
import mongoose from "mongoose";

export interface IUser {
    _id: string;
    name: string;
    brandName?: string;
    logo?: string;
    email: string;
    phone?: string;
    plan: "store" | "insta bot" | "whatsapp bot" | "Pro" | "free";
    role: "user" | "admin";
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brandName: {
        type: String,
        required: false,
        unique: true,
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
        enum: ["store", "insta bot", "whatsapp bot", "Pro", "free"],
        default: "free"
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
});

export default mongoose.models.User || mongoose.model("User", userSchema);
