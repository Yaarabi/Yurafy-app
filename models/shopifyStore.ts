import mongoose, { Schema, Document } from "mongoose";

export interface IShopifyStore extends Document {
    _id: string;
    owner: mongoose.Types.ObjectId;
    token: string;
    connect: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const shopifyStoreSchema = new Schema<IShopifyStore>(
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

export default mongoose.models.ShopifyStore || mongoose.model<IShopifyStore>("ShopifyStore", shopifyStoreSchema);
