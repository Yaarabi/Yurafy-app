import { connectDB } from "../db/mongoDB";
import Plan, { IPlan } from "@/models/support/plan";
import User from "@/models/users";
import { logger } from "./logging";

/**
 * Check and update expired plans
 * Should be run as a cron job or scheduled task
 */
export async function checkExpiredPlans(): Promise<void> {
    try {
        await connectDB();
        
        const now = new Date();
        
        // Find all active plans that have expired
        const expiredPlans = await Plan.find({
            status: "active",
            endDate: { $lt: now },
        });

        if (expiredPlans.length === 0) {
            logger.debug("No expired plans found");
            return;
        }

        logger.info(`Found ${expiredPlans.length} expired plans`, {
            count: expiredPlans.length,
        });

        // Update expired plans
        for (const plan of expiredPlans) {
            // Update plan status to expired
            plan.status = "expired";
            await plan.save();

            // Update user's current plan reference
            const user = await User.findOne({ currentPlanId: plan._id });
            if (user) {
                // Create or find free plan
                const freePlan = await Plan.findOne({
                    userId: user._id,
                    planKey: "free",
                    status: "active",
                });

                if (!freePlan) {
                    // Create new free plan
                    const newFreePlan = new Plan({
                        userId: user._id,
                        planKey: "free",
                        price: 0,
                        durationDays: 365,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                        status: "active",
                    });

                    await newFreePlan.save();
                    user.currentPlanId = newFreePlan._id;
                    await user.save();

                    logger.info("Created free plan for expired user", {
                        userId: user._id.toString(),
                        expiredPlanId: plan._id.toString(),
                    });
                } else {
                    user.currentPlanId = freePlan._id;
                    await user.save();

                    logger.info("Assigned existing free plan to expired user", {
                        userId: user._id.toString(),
                        expiredPlanId: plan._id.toString(),
                    });
                }
            }

            logger.info("Plan expired and user downgraded", {
                planId: plan._id.toString(),
                userId: plan.userId.toString(),
            });
        }

        logger.info("Plan expiration check completed", {
            expiredCount: expiredPlans.length,
        });
    } catch (error) {
        logger.error("Error checking expired plans", error);
        throw error;
    }
}

/**
 * Check plans expiring soon (e.g., within 7 days)
 * Can be used to send reminder notifications
 */
export async function checkPlansExpiringSoon(days: number = 7): Promise<IPlan[]> {
    try {
        await connectDB();

        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        const expiringPlans = await Plan.find({
            status: "active",
            endDate: {
                $gte: now,
                $lte: futureDate,
            },
        }).populate("userId", "email username");

        logger.info(`Found ${expiringPlans.length} plans expiring within ${days} days`, {
            count: expiringPlans.length,
            days,
        });

        return expiringPlans;
    } catch (error) {
        logger.error("Error checking expiring plans", error);
        throw error;
    }
}

