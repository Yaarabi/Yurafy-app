
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import Products from "@/models/store/products";

// ✅ GET Products (all or by id, but scoped to logged-in user)
export async function GET(req: Request) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id; // 👈 get owner from session
    // Ensure store feature is allowed for this user
    const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
    const featureCheck = await ensureFeatureEnabled(userId, 'store');
    if (featureCheck) return featureCheck;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    try {
        if (id) {
        const product = await Products.findOne({ _id: id, owner: userId });
        if (!product) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Product retrieved", product });
        }

        // Return all products for this user
        const products = await Products.find({ owner: userId });
        return NextResponse.json({ message: "User products retrieved", products });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}