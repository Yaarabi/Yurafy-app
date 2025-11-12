import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getUserActivePlan, checkPlanExpiration } from "./planLimits";

/**
 * Ensure a given feature is enabled for a user and the plan is not expired.
 * Returns null when allowed, otherwise returns a NextResponse JSON error to be returned from the route.
 *
 * featureKey examples: 'whatsapp', 'store', 'ai.agent', 'orders'
 */
export async function ensureFeatureEnabled(
    userId: string,
    featureKey: string,
    session?: mongoose.ClientSession,
    gracePeriodDays: number = 0
): Promise<null | NextResponse> {
    try {
        const planData = await getUserActivePlan(userId, session);
        if (!planData) {
            return NextResponse.json({ error: 'No plan found for user' }, { status: 403 });
        }

        const { plan, features, planKey } = planData;

        // If the plan has an expiration, check it (with optional grace period)
        if (plan) {
            const exp = await checkPlanExpiration(userId, gracePeriodDays);
            if (exp.isExpired && !exp.isInGracePeriod) {
                return NextResponse.json({ error: 'Your plan has expired. Please renew to continue using this feature.' }, { status: 403 });
            }
        }

        // Support nested keys like 'ai.agent'
        const parts = featureKey.split('.');
        let cur: any = features;
        for (const p of parts) {
            if (!cur) break;
            cur = cur[p];
        }

        // If feature object is boolean or has 'enabled' flag
        const enabled = typeof cur === 'boolean' ? cur : cur?.enabled;

        if (!enabled) {
            return NextResponse.json({ error: `Feature '${featureKey}' is not enabled in your current plan (${planKey}).` }, { status: 403 });
        }

        return null;
    } catch (err: any) {
        console.error('[PlanEnforcer] Error checking feature:', err);
        return NextResponse.json({ error: 'Failed to verify plan for this action' }, { status: 500 });
    }
}

/**
 * Convenience wrapper for routes: if feature not enabled, return the NextResponse
 */
export async function requireFeatureOrThrow(userId: string, featureKey: string, session?: mongoose.ClientSession) {
    const res = await ensureFeatureEnabled(userId, featureKey, session);
    if (res) throw res; // route should catch and return this
}
