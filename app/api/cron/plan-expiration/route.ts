import { NextRequest, NextResponse } from "next/server";
import { checkExpiredPlans } from "@/lib/utils/planExpiration";
import { logger } from "@/lib/utils/logging";

/**
 * Cron job endpoint for plan expiration
 * Should be called by a cron service (Vercel Cron, GitHub Actions, etc.)
 * 
 * Protection: Add CRON_SECRET header check in production
 */
export async function GET(req: NextRequest) {
    try {
        // Optional: Verify cron secret for security
        const cronSecret = req.headers.get("authorization");
        if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        logger.info("Plan expiration cron job started");
        
        await checkExpiredPlans();

        logger.info("Plan expiration cron job completed");

        return NextResponse.json({
            success: true,
            message: "Plan expiration check completed",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Plan expiration cron job failed", error);
        return NextResponse.json(
            {
                success: false,
                error: "Plan expiration check failed",
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

