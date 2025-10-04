
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Product from "@/models/products";

export async function GET(req: Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const category = searchParams.get("category");

        if (id) {
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Product retrieved", product });
        }

        if (category) {
        const products = await Product.find({ category });
        if (products.length === 0) {
            return NextResponse.json({ message: "No products found in this category" }, { status: 404 });
        }
        return NextResponse.json({ message: "Category products retrieved", products });
        }

        const products = await Product.find();
        return NextResponse.json({ message: "All products retrieved", products });

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

        return NextResponse.json({ message: "Product Deleted", data: result },{ status: 202 });
    } catch (error) {
        return NextResponse.json({ message: "Error in DELETE request", error }, { status: 500 });
    }
}