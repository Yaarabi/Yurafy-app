/**
 * Plan Access Control Utilities
 * Handles plan-based feature access and expiration checks
 */

import { connectDB } from "../db/mongoDB";
import User from "@/models/users";
import Plan from "@/models/plan";
import { PlanKey, hasFeature, getFeatureLimit } from "../config/planFeatures";

export interface PlanStatus {
    isValid: boolean;
    planKey: PlanKey;
    isExpired: boolean;
    daysRemaining: number;
    endDate?: Date;
    features: any;
}

/**
 * Check user's plan status and expiration
 */
export async function getUserPlanStatus(userId: string): Promise<PlanStatus | null> {
    await connectDB();

    const user = await User.findById(userId).populate('currentPlanId');
    if (!user || !user.currentPlanId) {
        return {
            isValid: true, // Free plan is always valid
            planKey: "free",
            isExpired: false, // Free plan never expires
            daysRemaining: 0,
            endDate: undefined,
            features: {},
        };
    }

    const plan = await Plan.findById(user.currentPlanId);
    if (!plan) {
        return {
            isValid: true, // Free plan is always valid
            planKey: "free",
            isExpired: false, // Free plan never expires
            daysRemaining: 0,
            endDate: undefined,
            features: {},
        };
    }

    const now = new Date();
    const isExpired = plan.status === "expired" || plan.endDate < now;
    const daysRemaining = isExpired 
        ? 0 
        : Math.ceil((plan.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Auto-update expired plans
    if (isExpired && plan.status !== "expired") {
        plan.status = "expired";
        await plan.save();
    }

    return {
        isValid: !isExpired && plan.status === "active",
        planKey: plan.planKey as PlanKey,
        isExpired,
        daysRemaining,
        endDate: plan.endDate,
        features: {},
    };
}

/**
 * Check if user has access to a specific feature
 */
export async function checkFeatureAccess(
    userId: string,
    featurePath: string
): Promise<{ hasAccess: boolean; reason?: string; limit?: number | null }> {
    const planStatus = await getUserPlanStatus(userId);
    
    if (!planStatus) {
        return { hasAccess: false, reason: "User plan not found" };
    }

    // Free plans never expire, so skip expiration check for free plans
    if (planStatus.isExpired && planStatus.planKey !== "free") {
        return { hasAccess: false, reason: "Plan has expired" };
    }

    const access = hasFeature(planStatus.planKey, featurePath);
    const limit = getFeatureLimit(planStatus.planKey, featurePath);

    return {
        hasAccess: access,
        reason: !access ? "Feature not available in your plan" : undefined,
        limit,
    };
}

/**
 * Middleware for protecting routes based on plan features
 */
export async function requireFeature(
    userId: string,
    featurePath: string
): Promise<{ allowed: boolean; error?: string; planStatus?: PlanStatus }> {
    const planStatus = await getUserPlanStatus(userId);

    if (!planStatus) {
        return { allowed: false, error: "Plan not found" };
    }

    // Free plans never expire, so skip expiration check for free plans
    if (planStatus.isExpired && planStatus.planKey !== "free") {
        return {
            allowed: false,
            error: `Your plan has expired. Please renew to continue using this feature.`,
            planStatus,
        };
    }

    if (!hasFeature(planStatus.planKey, featurePath)) {
        return {
            allowed: false,
            error: `This feature is not available in your current plan (${planStatus.planKey}). Please upgrade to access this feature.`,
            planStatus,
        };
    }

    return { allowed: true, planStatus };
}

/**
 * Get plan expiration warning
 */
export async function getPlanExpirationWarning(userId: string): Promise<string | null> {
    const planStatus = await getUserPlanStatus(userId);
    
    if (!planStatus || planStatus.isExpired) {
        return "Your plan has expired. Please renew to continue using all features.";
    }

    if (planStatus.daysRemaining <= 7 && planStatus.daysRemaining > 0) {
        return `Your plan expires in ${planStatus.daysRemaining} day(s). Please renew to avoid service interruption.`;
    }

    if (planStatus.daysRemaining <= 30 && planStatus.daysRemaining > 7) {
        return `Your plan expires in ${planStatus.daysRemaining} days. Consider renewing soon.`;
    }

    return null;
}

