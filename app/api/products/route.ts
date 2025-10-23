import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Product from "@/models/products";

export async function GET(req: Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const category = searchParams.get("category");
        const owner = searchParams.get("owner"); 

        // Fetch single product by ID
        if (id) {
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Product retrieved", product });
        }

        // Build dynamic query
        const query: Record<string, string> = {};
        if (category) query.category = category;
        if (owner) query.owner = owner;

        // Fetch products based on query
        const products = await Product.find(query);

        if (products.length === 0) {
        return NextResponse.json(
            { message: owner ? "No products found" : category ? "No products found in this category" : "No products found" },
            { status: 404 }
        );
        }

        return NextResponse.json({
        message: owner ? "Owner's products retrieved" : category ? "Category products retrieved" : "All products retrieved",
        products,
        });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await connectDB();
    try {
        const body = await req.json();
        const product = new Product(body);
        await product.save();
        return NextResponse.json({ message: "Product created successfully", product }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Upload failed", error }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const detail = await req.json();

        if (!id) return NextResponse.json({ message: "Product ID is required" }, { status: 400 });

        const result = await Product.findByIdAndUpdate(id, detail, { new: true });
        if (!result) return NextResponse.json({ message: "Product not found" }, { status: 404 });

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ message: "Error in PUT request", error }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ message: "Product ID is required" }, { status: 400 });

        const result = await Product.findByIdAndDelete(id);
        if (!result) return NextResponse.json({ message: "Product not found" }, { status: 404 });

        return NextResponse.json({ message: "Product Deleted", data: result }, { status: 202 });
    } catch (error) {
        return NextResponse.json({ message: "Error in DELETE request", error }, { status: 500 });
    }
    }
