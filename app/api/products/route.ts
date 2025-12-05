import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import Product from "@/models/products";
import { withRateLimit, DEFAULT_CONFIG } from "@/lib/utils/rateLimit";
import { handleApiError, createErrorResponse, isValidObjectId } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logging";

// ✅ GET Products - Public access for browsing, private for own products
export async function GET(req: NextRequest) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const category = searchParams.get("category");
        const owner = searchParams.get("owner");
        const search = searchParams.get("search"); // Search query parameter
        const session = await getServerSession(authOptions);

        // Fetch single product by ID (public)
        if (id) {
            if (!isValidObjectId(id)) {
                return createErrorResponse("Invalid product ID", 400, "INVALID_ID");
            }

            const product = await Product.findById(id);
            if (!product) {
                return createErrorResponse("Product not found", 404, "NOT_FOUND");
            }
            return NextResponse.json(
                { message: "Product retrieved", product },
                {
                    headers: {
                        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
                    },
                }
            );
        }

        // Build dynamic query
        const query: Record<string, any> = {};
        if (category) query.category = category;

        // If owner is specified, check if it's the current user or public access
        if (owner && owner !== 'undefined') {
            if (isValidObjectId(owner)) {
                // Allow users to see their own products, or allow public browsing
                if (session?.user?.id !== owner) {
                    // Public browsing - only show active products
                    query.owner = owner;
                } else {
                    // Own products - show all
                    query.owner = owner;
                }
            }
        }

        // Add search functionality
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { category: searchRegex },
                { brand: searchRegex },
                { slug: searchRegex },
            ];
        }

        const products = await Product.find(query).sort({ createdAt: -1 }).limit(20);

        return NextResponse.json(
            {
                message: owner ? "Products retrieved" : category ? "Category products retrieved" : "All products retrieved",
                products: products || [],
            },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
                },
            }
        );
    } catch (error) {
        logger.error("GET /api/products error", error);
        return handleApiError(error);
    }
}

// ✅ POST Create Product - Requires authentication and ownership
export const POST = withRateLimit(async (req: NextRequest) => {
    await connectDB();

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return createErrorResponse("Unauthorized - Authentication required", 401, "UNAUTHORIZED");
        }

        const userId = session.user.id;
        const body = await req.json();

    // Ensure store feature is allowed for this user
    const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
    const featureCheck = await ensureFeatureEnabled(userId, 'store');
    if (featureCheck) return featureCheck;

        // Validate required fields
        if (!body.name || !body.price || !body.category || !body.mainImage) {
            return createErrorResponse(
                "Missing required fields: name, price, category, mainImage",
                400,
                "MISSING_FIELDS"
            );
        }

        // Validate price and stock
        if (typeof body.price !== "number" || body.price < 0) {
            return createErrorResponse("Price must be a positive number", 400, "INVALID_PRICE");
        }

        if (typeof body.stock !== "number" || body.stock < 0) {
            return createErrorResponse("Stock must be a non-negative number", 400, "INVALID_STOCK");
        }

        // Generate slug if not provided
        const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        // Check if slug already exists
        const existingProduct = await Product.findOne({ slug });
        if (existingProduct) {
            return createErrorResponse("Product with this slug already exists", 409, "DUPLICATE_SLUG");
        }

        // ✅ FIXED: Use transaction for atomic limit check + creation
        const mongoose = (await import('mongoose')).default;
        const mongoSession = await mongoose.startSession();
        
        try {
            await mongoSession.withTransaction(async () => {
                // Check plan limits WITHIN transaction to prevent race conditions
                const { canPerformAction } = await import('@/lib/utils/planLimits');
                const canCreate = await canPerformAction(userId, 'create_product', mongoSession);
                if (!canCreate.allowed) {
                    throw new Error(canCreate.reason || "Plan limit reached");
                }

                // Create product within transaction
                const product = new Product({
                    ...body,
                    owner: userId,
                    slug,
                    salesCount: 0,
                });

                await product.save({ session: mongoSession });

                // Re-check limit after creation within same transaction
                const limitCheck = await import('@/lib/utils/planLimits');
                const { checkPlanLimit } = limitCheck;
                const afterCheck = await checkPlanLimit(userId, 'products', mongoSession);
                
                if (afterCheck.hasReachedLimit && afterCheck.limit !== null) {
                    // Deactivate products beyond limit immediately
                    const products = await Product.find({ owner: userId, enabled: true })
                        .sort({ createdAt: -1 })
                        .skip(afterCheck.limit)
                        .session(mongoSession);
                    
                    for (const p of products) {
                        p.enabled = false;
                        await p.save({ session: mongoSession });
                    }
                }
            });
        } catch (error: any) {
            await mongoSession.endSession();
            if (error.message?.includes('limit') || error.message?.includes('plan')) {
                return createErrorResponse(error.message, 403, "PLAN_LIMIT_REACHED");
            }
            throw error;
        } finally {
            await mongoSession.endSession();
        }

        // Get the created product (outside transaction)
        const product = await Product.findOne({ slug, owner: userId });
        if (!product) {
            return createErrorResponse("Failed to create product", 500, "CREATION_FAILED");
        }

        // Send notification if limit reached (outside transaction to avoid blocking)
        try {
            const { deactivateFeaturesOnLimitReached } = await import('@/lib/utils/planLimits');
            await deactivateFeaturesOnLimitReached(userId);
        } catch (error) {
            console.error('Error sending limit notification:', error);
            // Don't fail product creation if notification fails
        }

        logger.info("Product created", { productId: product._id, ownerId: userId });
        return NextResponse.json({ message: "Product created successfully", product }, { status: 201 });
    } catch (error) {
        logger.error("POST /api/products error", error);
        return handleApiError(error);
    }
}, DEFAULT_CONFIG);

// ✅ PUT Update Product - Requires authentication and ownership
export const PUT = withRateLimit(async (req: NextRequest) => {
    await connectDB();

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return createErrorResponse("Unauthorized - Authentication required", 401, "UNAUTHORIZED");
        }

        const userId = session.user.id;
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const detail = await req.json();

    // Ensure store feature is allowed for this user
    const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
    const featureCheck = await ensureFeatureEnabled(userId, 'store');
    if (featureCheck) return featureCheck;

        if (!id) {
            return createErrorResponse("Product ID is required", 400, "MISSING_ID");
        }

        if (!isValidObjectId(id)) {
            return createErrorResponse("Invalid product ID", 400, "INVALID_ID");
        }

        // Check ownership
        const product = await Product.findById(id);
        if (!product) {
            return createErrorResponse("Product not found", 404, "NOT_FOUND");
        }

        if (product.owner.toString() !== userId) {
            return createErrorResponse("Forbidden - You don't own this product", 403, "FORBIDDEN");
        }

        // Validate price and stock if provided
        if (detail.price !== undefined && (typeof detail.price !== "number" || detail.price < 0)) {
            return createErrorResponse("Price must be a positive number", 400, "INVALID_PRICE");
        }

        if (detail.stock !== undefined && (typeof detail.stock !== "number" || detail.stock < 0)) {
            return createErrorResponse("Stock must be a non-negative number", 400, "INVALID_STOCK");
        }

        // Update product
        const result = await Product.findByIdAndUpdate(id, detail, { new: true, runValidators: true });
        if (!result) {
            return createErrorResponse("Product not found", 404, "NOT_FOUND");
        }

        logger.info("Product updated", { productId: id, ownerId: userId });
        return NextResponse.json({ message: "Product updated successfully", product: result });
    } catch (error) {
        logger.error("PUT /api/products error", error);
        return handleApiError(error);
    }
}, DEFAULT_CONFIG);

// ✅ DELETE Product - Requires authentication and ownership
export const DELETE = withRateLimit(async (req: NextRequest) => {
    await connectDB();

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return createErrorResponse("Unauthorized - Authentication required", 401, "UNAUTHORIZED");
        }

        const userId = session.user.id;
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return createErrorResponse("Product ID is required", 400, "MISSING_ID");
        }

        if (!isValidObjectId(id)) {
            return createErrorResponse("Invalid product ID", 400, "INVALID_ID");
        }

        // Ensure store feature is allowed for this user
        const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
        const featureCheck = await ensureFeatureEnabled(userId, 'store');
        if (featureCheck) return featureCheck;

        // Check ownership before deletion
        const product = await Product.findById(id);
        if (!product) {
            return createErrorResponse("Product not found", 404, "NOT_FOUND");
        }

        if (product.owner.toString() !== userId) {
            return createErrorResponse("Forbidden - You don't own this product", 403, "FORBIDDEN");
        }

        const result = await Product.findByIdAndDelete(id);
        if (!result) {
            return createErrorResponse("Product not found", 404, "NOT_FOUND");
        }

        logger.info("Product deleted", { productId: id, ownerId: userId });
        return NextResponse.json({ message: "Product deleted successfully", data: result }, { status: 200 });
    } catch (error) {
        logger.error("DELETE /api/products error", error);
        return handleApiError(error);
    }
}, DEFAULT_CONFIG);
