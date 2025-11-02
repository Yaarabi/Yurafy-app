
import mongoose, { Schema } from "mongoose";

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
        owner: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true,
            index: true, // Index for owner-based queries
        },
        name: { 
            type: String, 
            required: true, 
            trim: true,
            index: true, // Index for search
        },
        slug: { 
            type: String, 
            required: true, 
            unique: true, 
            lowercase: true,
            index: true, // Unique index already exists
        },
        description: { type: String },
        price: { 
            type: Number, 
            required: true,
            index: true, // Index for price sorting/filtering
        },
        discount: { type: Number, default: 0 },
        stock: { 
            type: Number, 
            required: true, 
            default: 0,
            index: true, // Index for stock queries
        },
        category: { 
            type: String, 
            required: true,
            index: true, // Index for category filtering
        },
        mainImage: { type: String, required: true },
        images: [{ type: String, required: false }],
        sizes: [{ type: String }],
        colors: [{ type: String }],
        salesCount: { 
            type: Number, 
            default: 0,
            index: true, // Index for sorting by popularity
        }, 
    },
    { timestamps: true }
);

// Compound indexes for common queries
ProductSchema.index({ owner: 1, category: 1 });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ owner: 1, createdAt: -1 });
ProductSchema.index({ createdAt: -1 }); // For recent products

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
