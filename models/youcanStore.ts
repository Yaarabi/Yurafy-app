import mongoose, { Schema, Document } from "mongoose";

export interface IYouCanStore extends Document {
    _id: string;
    owner: mongoose.Types.ObjectId;
    token: string;
    clientId: string;
    clientSecret: string;
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
        clientId: {
            type: String,
            required: true,
            trim: true,
        },
        clientSecret: {
            type: String,
            required: true,
            trim: true,
        },
        connect: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

youcanStoreSchema.index({ owner: 1 });

export default mongoose.models.YouCanStore || mongoose.model<IYouCanStore>("YouCanStore", youcanStoreSchema);
