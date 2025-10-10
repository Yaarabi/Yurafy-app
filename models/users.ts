
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brandName: {
        type: String,
        required: false,
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
