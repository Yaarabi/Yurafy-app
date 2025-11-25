import mongoose, { Schema, Document } from "mongoose";

export interface IWooStore extends Document {
    _id: string;
    owner: mongoose.Types.ObjectId;
    token: string;
    connect: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const wooStoreSchema = new Schema<IWooStore>(
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
        connect: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

wooStoreSchema.index({ owner: 1 });

export default mongoose.models.WooStore || mongoose.model<IWooStore>("WooStore", wooStoreSchema);
