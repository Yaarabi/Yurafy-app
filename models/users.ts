
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    // lastName: {
    //     type: String,
    //     required: true,
    //     trim: true
    // },
    brandName: {
        type: String,
        required: false,
        trim: true
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

const User = mongoose.model("User", userSchema);
export default User;
