import { tool } from "@langchain/core/tools";
import { z } from "zod";
import mongoose from "mongoose";
import Product, { IProduct } from "@/models/store/products";
import { connectDB } from "@/lib/db/mongoDB";

/**
 * 🔍 Search products by name, category, brand, or slug
 */
export const searchProductTool = tool(
    async ({ ownerId, query }) => {
        await connectDB();

        console.log(`[searchProductTool] Searching for "${query}" with ownerId: ${ownerId}`);

        const products = await Product.find({
            owner: new mongoose.Types.ObjectId(ownerId),
            $or: [
                { name: new RegExp(query, "i") },
                { category: new RegExp(query, "i") },
                { brand: new RegExp(query, "i") },
                { slug: new RegExp(query, "i") },
            ],
        })
        .limit(10)
        .lean<IProduct[]>(); 

        console.log(`[searchProductTool] Found ${products.length} products`);

        if (!products.length) return `No products found matching "${query}".`;

        // Return as formatted string for Mistral AI compatibility
        const productList = products.map((p) => 
            `• ${p.name} (ID: ${p._id?.toString()}) - Price: ${p.price}${p.discount ? ` (${p.discount}% off)` : ''}, Stock: ${p.stock}, Category: ${p.category}${p.brand ? `, Brand: ${p.brand}` : ''}`
        ).join('\n');
        
        return `Found ${products.length} product(s):\n${productList}`;
    },
    {
        name: "search_product",
        description: "Search for products by name or slug.",
        schema: z.object({
        ownerId: z.string().describe("The ID of the business owner"),
        query: z.string().describe(
            "Search keyword (e.g., name, slug, brand, or category)"
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

/**
 * 📋 List all products (name and slug only)
 */
export const listProductsTool = tool(
    async ({ ownerId }) => {
        await connectDB();

        const products = await Product.find({ 
            owner: new mongoose.Types.ObjectId(ownerId) 
        })
        .select("name slug")
        .lean<{ name: string; slug: string }[]>();

        if (!products.length) return "No products found for this owner.";

        // Return as formatted string for Mistral AI compatibility
        const productList = products.map((p) => `• ${p.name} (slug: ${p.slug})`).join('\n');
        return `Available products (${products.length} total):\n${productList}`;
    },
    {
        name: "list_products",
        description: "Get a list of all products with their names and slugs. Use this to see what products are available.",
        schema: z.object({
            ownerId: z.string().describe("The ID of the business owner"),
        }),
    }
);
