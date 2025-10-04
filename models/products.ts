
import mongoose, { Schema, Document } from "mongoose";

export interface IProduct {
    name: string;
    slug: string;
    description?: string;
    price: number;
    discount?: number;
    stock: number;
    category: string;
    brand?: string;
    images: string[];
    variants?: {
        size?: string;
        color?: string;
        price?: number;
        stock?: number;
    }[];
    salesCount: number; 
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        stock: { type: Number, required: true, default: 0 },
        category: { type: String, required: true },
        brand: { type: String },
        images: [{ type: String, required: true }],
        variants: [
        {
            size: { type: String },
            color: { type: String },
            price: { type: Number },
            stock: { type: Number, default: 0 },
        },
        ],
        salesCount: { type: Number, default: 0 }, 
    },
    { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
