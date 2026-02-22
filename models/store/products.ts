
import mongoose, { Schema } from "mongoose";

export interface IProduct {
    _id?: string;
    owner: string,
    name: string;
    slug: string;
    description?: string;
    price: number;
    currency?: string; // e.g., '$', '€', 'MAD', 'DH'
    discount?: number;
    stock: number;
    category: string;
    brand?: string;
    mainImage: string;
    images: string[];
    descriptionsImage?: string[]; // Images for description section (different from mainImage and images)
    sizes?: string[]; // ✅ Changed: Now accepts any string (e.g., "L", "40", "XL")
    colors?: string[];
    specifications?: { // ✅ Added: Product specifications
        title: string;
        description: string;
    }[];
    bundles?: { // ✅ Added: Bundle/promotion configuration
        type: "buy_x_get_y" | "special_price" | "percentage_off";
        buyQuantity?: number; // For "buy_x_get_y": buy 2
        getQuantity?: number; // For "buy_x_get_y": get 1 free
        specialPrice?: number; // For "special_price": price for bundle
        percentageOff?: number; // For "percentage_off": discount percentage
        enabled: boolean;
    };
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
        },
        name: { 
            type: String, 
            required: true, 
            trim: true,
        },
        slug: { 
            type: String, 
            required: true, 
            unique: true, 
            lowercase: true,
        },
        description: { type: String },
        price: { 
            type: Number, 
            required: true,
        },
        currency: { 
            type: String, 
            default: '$',
        },
        discount: { type: Number, default: 0 },
        stock: { 
            type: Number, 
            required: true, 
            default: 0,
        },
        category: { 
            type: String, 
            required: true,
        },
        mainImage: { type: String, required: true },
        images: [{ type: String, required: false }],
        descriptionsImage: [{ type: String }], // Images for description section (different from mainImage and images)
        sizes: [{ type: String }], // ✅ Changed: Accepts any string values
        colors: [{ type: String }],
        specifications: [ // ✅ Added: Product specifications
            {
                title: { type: String, required: true },
                description: { type: String, required: true },
                _id: false,
            }
        ],
        bundles: { // ✅ Added: Bundle/promotion configuration
            type: {
                type: String,
                enum: ["buy_x_get_y", "special_price", "percentage_off"],
            },
            buyQuantity: { type: Number }, // e.g., buy 2
            getQuantity: { type: Number }, // e.g., get 1 free
            specialPrice: { type: Number }, // e.g., $50 for bundle
            percentageOff: { type: Number }, // e.g., 20% off
            enabled: { type: Boolean, default: false },
        },
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
