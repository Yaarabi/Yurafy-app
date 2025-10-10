
import mongoose, { Schema, Document } from "mongoose";

export interface IProduct {
    _id?: string;
    owner: string,
    name: string;
    slug: string;
    description?: string;
    price: number;
    discount?: number;
    stock: number;
    category: string;
    brand?: string;
    mainImage: string;
    images: string[];
    sizes?: string[];
    colors?: string[];
    salesCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        stock: { type: Number, required: true, default: 0 },
        category: { type: String, required: true },
        mainImage: { type: String, required: true },
        images: [{ type: String, required: false }],
        sizes: [{ type: String }],
        colors: [{ type: String }],
        salesCount: { type: Number, default: 0 }, 
    },
    { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
