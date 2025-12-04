import mongoose, { Schema, Document } from "mongoose";

export interface IYouCanStore extends Document {
    _id: string;
    owner: mongoose.Types.ObjectId;
    token: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    subscriptionId?: string;
    connect: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const youcanStoreSchema = new Schema<IYouCanStore>(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        token: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        accessToken: {
            type: String,
            required: false,
            trim: true,
        },
        refreshToken: {
            type: String,
            required: false,
            trim: true,
        },
        expiresAt: {
            type: Date,
            required: false,
        },
        subscriptionId: {
            type: String,
            required: false,
            trim: true,
            index: true,
        },
        connect: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.YouCanStore || mongoose.model<IYouCanStore>("YouCanStore", youcanStoreSchema);
