import { tool } from "@langchain/core/tools";
import { z } from "zod";
import mongoose from "mongoose";
import Product, { IProduct } from "@/models/products";
import { connectDB } from "@/lib/db/mongoDB";

/**
 * 🔍 Search products by name, category, brand, or slug
 */
export const searchProductTool = tool(
    async ({ ownerId, query }) => {
        await connectDB();

        const products = await Product.find<IProduct>({
        owner: new mongoose.Types.ObjectId(ownerId),
        $or: [
            { name: new RegExp(query, "i") },
            { category: new RegExp(query, "i") },
            { brand: new RegExp(query, "i") },
            { slug: new RegExp(query, "i") },
        ],
        })
        .limit(10)
        .lean<IProduct[]>(); // ✅ Properly typed lean result

        if (!products.length) return "No products found for that query.";

        return products.map((p) => ({
        id: p._id?.toString(),
        name: p.name,
        price: p.price,
        discount: p.discount,
        category: p.category,
        stock: p.stock,
        brand: p.brand,
        }));
    },
    {
        name: "search_product",
        description: "Search for products by name, category, brand, or slug.",
        schema: z.object({
        ownerId: z.string().describe("The ID of the business owner"),
        query: z.string().describe(
            "Search keyword (e.g., name, brand, or category)"
        ),
        }),
    }
);

/**
 * 🆕 Create new product
 */
export const createProductTool = tool(
    async ({
        ownerId,
        name,
        slug,
        description,
        price,
        discount,
        stock,
        category,
        brand,
        mainImage,
        images,
        sizes,
        colors,
    }) => {
        await connectDB();

        const existing = await Product.findOne<IProduct>({ owner: ownerId, slug });
        if (existing) return `A product with slug "${slug}" already exists.`;

        const newProduct = await Product.create<IProduct>({
        owner: new mongoose.Types.ObjectId(ownerId),
        name,
        slug,
        description,
        price,
        discount,
        stock,
        category,
        brand,
        mainImage,
        images,
        sizes,
        colors,
        salesCount: 0, // ✅ ensure required field
        });

        return `✅ Product "${newProduct.name}" created successfully (ID: ${newProduct._id}).`;
    },
    {
        name: "create_product",
        description: "Create a new product for the store.",
        schema: z.object({
        ownerId: z.string().describe("The ID of the business owner"),
        name: z.string().describe("Product name"),
        slug: z.string().describe("Unique slug for the product (used in URLs)"),
        description: z.string().optional(),
        price: z.number().describe("Product price"),
        discount: z.number().optional(),
        stock: z.number().describe("Initial stock quantity"),
        category: z.string().describe("Product category"),
        brand: z.string().optional(),
        mainImage: z.string().describe("Main product image URL"),
        images: z.array(z.string()).optional(),
        sizes: z.array(z.string()).optional(),
        colors: z.array(z.string()).optional(),
        }),
    }
);
