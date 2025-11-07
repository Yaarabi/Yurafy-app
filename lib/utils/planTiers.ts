/**
 * Plan Tier Utilities
 * Defines plan hierarchy for upgrade/downgrade logic
 */

export type PlanTier = 'free' | 'starter' | 'whatsapp' | 'ai' | 'pro' | 'visionary';

/**
 * Plan tier hierarchy (lower number = lower tier)
 */
export const PLAN_TIERS: Record<string, number> = {
    'free': 0,
    'starter': 1,
    'whatsapp automation': 2,
    'ai whatsapp agent': 3,
    'pro seller': 4,
    'visionary': 5,
};

/**
 * Normalize plan key to tier name
 */
export function normalizePlanKeyToTier(planKey: string): string {
    const normalized = planKey.toLowerCase().trim();
    
    // Handle special plans - check if it has a basePlanKey
    // Special plans have the same tier as their base plan
    
    // Map plan keys to tier names
    if (normalized === 'free') return 'free';
    if (normalized === 'starter') return 'starter';
    if (normalized.includes('whatsapp') && normalized.includes('automation') && !normalized.includes('ai')) {
        return 'whatsapp automation';
    }
    if (normalized.includes('ai') || normalized.includes('agent')) {
        return 'ai whatsapp agent';
    }
    if (normalized.includes('pro') || normalized.includes('seller')) {
        return 'pro seller';
    }
    if (normalized === 'visionary') return 'visionary';
    
    // Default fallback
    return normalized;
}

/**
 * Get plan tier number
 */
export function getPlanTier(planKey: string): number {
    const tierName = normalizePlanKeyToTier(planKey);
    return PLAN_TIERS[tierName] ?? 0;
}

/**
 * Check if plan A is higher tier than plan B
 */
export function isHigherTier(planA: string, planB: string): boolean {
    return getPlanTier(planA) > getPlanTier(planB);
}

/**
 * Check if plan A is lower tier than plan B
 */
export function isLowerTier(planA: string, planB: string): boolean {
    return getPlanTier(planA) < getPlanTier(planB);
}

/**
 * Check if plan A is same or higher tier than plan B
 */
export function isSameOrHigherTier(planA: string, planB: string): boolean {
    return getPlanTier(planA) >= getPlanTier(planB);
}

/**
 * Check if plan upgrade is allowed (prevent downgrades)
 */
export function canUpgrade(fromPlanKey: string, toPlanKey: string): { allowed: boolean; reason?: string } {
    const fromTier = getPlanTier(fromPlanKey);
    const toTier = getPlanTier(toPlanKey);
    
    // Allow same tier (e.g., switching between special plans of same base)
    if (fromTier === toTier) {
        return { allowed: true };
    }
    
    // Prevent downgrades
    if (toTier < fromTier) {
        const tierNames = Object.keys(PLAN_TIERS);
        const fromTierName = tierNames.find(t => PLAN_TIERS[t] === fromTier) || fromPlanKey;
        const toTierName = tierNames.find(t => PLAN_TIERS[t] === toTier) || toPlanKey;
        
        return {
            allowed: false,
            reason: `Cannot downgrade from ${fromTierName} to ${toTierName}. Please contact support if you need to change your plan.`
        };
    }
    
    return { allowed: true };
}

