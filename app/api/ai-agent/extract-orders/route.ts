import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import { extractOrdersFromMessagesTool } from "@/lib/agent/tools/orderTools";

/**
 * POST /api/ai-agent/extract-orders
 * Manually trigger order extraction from selected messages
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { customerPhone, messageIds, startDate, endDate } = await req.json();

        if (!customerPhone) {
            return NextResponse.json(
                { error: "Missing customerPhone" },
                { status: 400 }
            );
        }

        await connectDB();

        // Call the tool directly
        const result = await extractOrdersFromMessagesTool.invoke({
            ownerId: session.user.id,
            customerPhone,
            messageIds,
            startDate,
            endDate,
        });

        // Parse the result to determine success/failure
        const isSuccess = typeof result === 'string' && result.includes('✅');
        const isNoOrder = typeof result === 'string' && result.includes('ℹ️');

        if (isSuccess) {
            return NextResponse.json({
                success: true,
                message: result,
            });
        } else if (isNoOrder) {
            return NextResponse.json({
                success: false,
                message: result,
            }, { status: 200 }); // Not an error, just no order found
        } else {
            return NextResponse.json({
                success: false,
                error: result,
            }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Extract orders API error:', error);
        return NextResponse.json(
            { error: error.message || "Failed to extract orders" },
            { status: 500 }
        );
    }
}
