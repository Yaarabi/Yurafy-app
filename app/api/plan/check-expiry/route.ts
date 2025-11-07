/**
 * API Route: Check Plan Expiry and Limits
 * This endpoint can be called by a cron job to check plan expiration and limits
 * GET /api/plan/check-expiry
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoDB';
import User from '@/models/users';
import Plan from '@/models/plan';
import { createPlanExpiryNotification, createPlanLimitNotification } from '@/lib/utils/notifications';
import { deactivateFeaturesOnLimitReached, checkPlanLimit } from '@/lib/utils/planLimits';
import { planFeatures } from '@/lib/config/planFeatures';

/**
 * Check all users' plans for expiration and limits
 * This should be called by a cron job (e.g., daily)
 */
export async function GET(req: NextRequest) {
    try {
        // Optional: Add authentication/authorization for cron jobs
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const users = await User.find({ role: 'user' }).populate('currentPlanId');
        const results = {
            checked: 0,
            expired: 0,
            expiringSoon: 0,
            limitReached: 0,
            errors: [] as string[],
        };

        for (const user of users) {
            try {
                results.checked++;

                if (!user.currentPlanId) {
                    continue;
                }

                const plan = await Plan.findById(user.currentPlanId);
                if (!plan) {
                    continue;
                }

                const now = new Date();
                const daysRemaining = Math.ceil((plan.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                // Check plan expiration
                if (plan.status === 'active' && plan.planKey !== 'free') {
                    if (daysRemaining <= 0) {
                        // Plan expired
                        plan.status = 'expired';
                        await plan.save();
                        results.expired++;

                        await createPlanExpiryNotification(
                            user._id.toString(),
                            plan.planKey,
                            0
                        );

                        // Deactivate features
                        await deactivateFeaturesOnLimitReached(user._id.toString());
                    } else if (daysRemaining <= 7) {
                        // Plan expiring soon (7 days or less)
                        results.expiringSoon++;

                        await createPlanExpiryNotification(
                            user._id.toString(),
                            plan.planKey,
                            daysRemaining
                        );
                    }
                }

                // Check plan limits
                const planKey = plan.planKey as keyof typeof planFeatures;
                const features = planFeatures[planKey] || planFeatures.free;

                // Check products limit
                if (features.store?.maxProducts !== undefined) {
                    const { hasReachedLimit, currentUsage, limit } = await checkPlanLimit(
                        user._id.toString(),
                        'products'
                    );
                    if (hasReachedLimit && limit !== null) {
                        results.limitReached++;
                        await createPlanLimitNotification(
                            user._id.toString(),
                            'products',
                            currentUsage,
                            limit
                        );
                        await deactivateFeaturesOnLimitReached(user._id.toString());
                    }
                }

                // Check orders limit
                if (features.orders?.maxOrders !== undefined) {
                    const { hasReachedLimit, currentUsage, limit } = await checkPlanLimit(
                        user._id.toString(),
                        'orders'
                    );
                    if (hasReachedLimit && limit !== null) {
                        results.limitReached++;
                        await createPlanLimitNotification(
                            user._id.toString(),
                            'orders',
                            currentUsage,
                            limit
                        );
                    }
                }

            } catch (error) {
                const errorMsg = `Error processing user ${user._id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                results.errors.push(errorMsg);
                console.error(errorMsg, error);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Plan expiry and limits check completed',
            results,
        });
    } catch (error) {
        console.error('Error in plan expiry check:', error);
        return NextResponse.json(
            { error: 'Failed to check plan expiry and limits' },
            { status: 500 }
        );
    }
}

