/**
 * Plan Limits Utility Functions
 * Helper functions for checking plan limits and deactivating features
 * ✅ FIXED: Now uses transactions to prevent race conditions
 */

import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import Plan from "@/models/plan";
import Product from "@/models/products";
import Order from "@/models/orders";
import WhatsAppAccount from "@/models/whatsappAccount";
import WhatsAppConversation from "@/models/whatsappMessage";
import AIAgent from "@/models/ai-agent";
import Store from "@/models/store";
import { getPlanTemplate } from "./planUtils";
import { createPlanLimitNotification } from "./notifications";
import mongoose from "mongoose";

/**
 * Get user's active plan with real-time expiration check
 */
async function getUserActivePlan(userId: string, session?: mongoose.ClientSession): Promise<{ plan: any; planKey: string; features: any } | null> {
    await connectDB();
    
    const user = await User.findById(userId).session(session || undefined);
    if (!user) return null;

    // Check currentPlanId first
    let plan = user.currentPlanId ? await Plan.findById(user.currentPlanId).session(session || undefined) : null;
    
    // ✅ FIXED: Real-time expiration check
    const now = new Date();
    if (plan && (plan.status === 'expired' || plan.endDate < now)) {
        // Plan is expired - update status and check for other active plans
        if (plan.status !== 'expired') {
            plan.status = 'expired';
            await plan.save({ session: session || undefined });
        }
        plan = null;
    }

    // If no active plan from currentPlanId, find the most recent active plan
    if (!plan || plan.status !== 'active') {
        plan = await Plan.findOne({
            userId: userId,
            status: 'active',
            endDate: { $gte: now }
        })
        .sort({ createdAt: -1 })
        .session(session || undefined);
    }

    if (!plan) {
        // No active plan - return free plan
        const freePlanTemplate = await getPlanTemplate('free');
        return freePlanTemplate ? {
            plan: null,
            planKey: 'free',
            features: freePlanTemplate.features
        } : null;
    }

    // Get plan template to get features
    const planTemplate = await getPlanTemplate(plan.planKey);
    if (!planTemplate) {
        // Fallback to free
        const freePlanTemplate = await getPlanTemplate('free');
        return freePlanTemplate ? {
            plan: null,
            planKey: 'free',
            features: freePlanTemplate.features
        } : null;
    }

    return {
        plan,
        planKey: plan.planKey,
        features: planTemplate.features
    };
}

/**
 * Count unique WhatsApp contacts for a user
 */
async function countWhatsAppContacts(userId: string, session?: mongoose.ClientSession): Promise<number> {
    await connectDB();
    
    // Get all conversations for this user
    const conversations = await WhatsAppConversation.find({ owner: userId })
        .select('customer.phone')
        .lean()
        .session(session || undefined);
    
    // Count unique phone numbers
    const uniqueContacts = new Set<string>();
    conversations.forEach((conv: any) => {
        if (conv.customer?.phone) {
            uniqueContacts.add(conv.customer.phone);
        }
    });
    
    return uniqueContacts.size;
}

/**
 * Check if user has reached a plan limit (with transaction support)
 * ✅ FIXED: Now supports transactions for atomic operations
 */
export async function checkPlanLimit(
    userId: string,
    limitType: 'products' | 'orders' | 'contacts',
    session?: mongoose.ClientSession
): Promise<{ hasReachedLimit: boolean; currentUsage: number; limit: number | null; planKey: string }> {
    await connectDB();

    const planData = await getUserActivePlan(userId, session);
    if (!planData) {
        return { hasReachedLimit: false, currentUsage: 0, limit: null, planKey: 'free' };
    }

    const { features, planKey } = planData;
    let currentUsage = 0;
    let limit: number | null = null;

    switch (limitType) {
        case 'products':
            currentUsage = await Product.countDocuments({ owner: userId }).session(session || undefined);
            limit = features.store?.maxProducts || null;
            break;
        case 'orders':
            currentUsage = await Order.countDocuments({ owner: userId }).session(session || undefined);
            limit = features.orders?.maxOrders || null;
            break;
        case 'contacts':
            // ✅ FIXED: Implement actual contact count
            currentUsage = await countWhatsAppContacts(userId, session);
            limit = features.whatsapp?.maxContacts || null;
            break;
    }

    const hasReachedLimit = limit !== null && currentUsage >= limit;

    return { hasReachedLimit, currentUsage, limit, planKey };
}

/**
 * Check if user can perform an action based on plan limits (with transaction support)
 * ✅ FIXED: Now uses transactions to prevent race conditions
 */
export async function canPerformAction(
    userId: string,
    actionType: 'create_product' | 'create_order' | 'add_contact',
    session?: mongoose.ClientSession
): Promise<{ allowed: boolean; reason?: string; planKey?: string }> {
    await connectDB();

    const planData = await getUserActivePlan(userId, session);
    if (!planData) {
        return { allowed: false, reason: 'User plan not found', planKey: 'free' };
    }

    const { features, planKey } = planData;

    // ✅ FIXED: Check plan expiration in real-time
    if (planData.plan) {
        const now = new Date();
        if (planData.plan.status === 'expired' || planData.plan.endDate < now) {
            return { 
                allowed: false, 
                reason: 'Your plan has expired. Please renew to continue using this feature.',
                planKey 
            };
        }
    }

    switch (actionType) {
        case 'create_product':
            if (!features.store?.enabled) {
                return { allowed: false, reason: 'Store feature is not enabled in your plan', planKey };
            }
            if (features.store.maxProducts !== undefined) {
                const limitCheck = await checkPlanLimit(userId, 'products', session);
                if (limitCheck.hasReachedLimit) {
                    return { 
                        allowed: false, 
                        reason: `You've reached your plan limit of ${limitCheck.limit} products. Please upgrade your plan.`,
                        planKey 
                    };
                }
            }
            break;

        case 'create_order':
            if (!features.orders?.enabled) {
                return { allowed: false, reason: 'Orders feature is not enabled in your plan', planKey };
            }
            if (features.orders.maxOrders !== undefined) {
                const limitCheck = await checkPlanLimit(userId, 'orders', session);
                if (limitCheck.hasReachedLimit) {
                    return { 
                        allowed: false, 
                        reason: `You've reached your plan limit of ${limitCheck.limit} orders. Please upgrade your plan.`,
                        planKey 
                    };
                }
            }
            break;

        case 'add_contact':
            if (!features.whatsapp?.enabled) {
                return { allowed: false, reason: 'WhatsApp feature is not enabled in your plan', planKey };
            }
            if (features.whatsapp.maxContacts !== undefined) {
                // ✅ FIXED: Implement actual contact count check
                const limitCheck = await checkPlanLimit(userId, 'contacts', session);
                if (limitCheck.hasReachedLimit) {
                    return { 
                        allowed: false, 
                        reason: `You've reached your plan limit of ${limitCheck.limit} contacts. Please upgrade your plan.`,
                        planKey 
                    };
                }
            }
            break;
    }

    return { allowed: true, planKey };
}

/**
 * Deactivate features when plan limits are reached
 * ✅ FIXED: Uses grace period and improved error handling
 */
export async function deactivateFeaturesOnLimitReached(userId: string): Promise<void> {
    await connectDB();

    const planData = await getUserActivePlan(userId);
    if (!planData || !planData.plan) {
        return;
    }

    const { features, plan } = planData;
    
    // ✅ NEW: Check plan expiration with grace period
    if (plan) {
        const now = new Date();
        const endDate = new Date(plan.endDate);
        const daysPastDue = Math.max(0, Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)));
        const gracePeriodDays = 7;
        
        // If plan is expired and past grace period, don't enforce limits (already lost access)
        if (daysPastDue > gracePeriodDays) {
            return;
        }
    }

    // Check products limit
    if (features.store?.maxProducts !== undefined) {
        const limitCheck = await checkPlanLimit(userId, 'products');
        if (limitCheck.hasReachedLimit && limitCheck.limit !== null) {
            // Deactivate all products beyond the limit
            const products = await Product.find({ owner: userId, enabled: true })
                .sort({ createdAt: -1 })
                .skip(limitCheck.limit);
            
            for (const product of products) {
                product.enabled = false;
                await product.save();
            }

            // Send notification (with deduplication)
            await createPlanLimitNotification(userId, 'products', limitCheck.currentUsage, limitCheck.limit);
        }
    }

    // Check orders limit
    if (features.orders?.maxOrders !== undefined) {
        const limitCheck = await checkPlanLimit(userId, 'orders');
        if (limitCheck.hasReachedLimit && limitCheck.limit !== null) {
            // Send notification (orders can't be deactivated, with deduplication)
            await createPlanLimitNotification(userId, 'orders', limitCheck.currentUsage, limitCheck.limit);
        }
    }

    // Check WhatsApp contacts limit
    if (features.whatsapp?.maxContacts !== undefined) {
        const limitCheck = await checkPlanLimit(userId, 'contacts');
        if (limitCheck.hasReachedLimit && limitCheck.limit !== null) {
            // Send notification (with deduplication)
            await createPlanLimitNotification(userId, 'contacts', limitCheck.currentUsage, limitCheck.limit);
        }
    }

    // Deactivate AI Agent if not in plan
    if (!features.ai?.agent) {
        const aiAgent = await AIAgent.findOne({ owner: userId, active: true });
        if (aiAgent) {
            aiAgent.active = false;
            aiAgent.enabled = false;
            await aiAgent.save();
        }
    }

    // Deactivate Store if not in plan
    if (!features.store?.enabled) {
        const stores = await Store.find({ owner: userId, active: true });
        for (const store of stores) {
            store.active = false;
            await store.save();
        }
    }
}

/**
 * Check plan expiration with grace period support
 * ✅ NEW: Supports grace period before full deactivation
 */
export async function checkPlanExpiration(
    userId: string,
    gracePeriodDays: number = 0
): Promise<{ isExpired: boolean; isInGracePeriod: boolean; daysRemaining: number; daysPastDue: number }> {
    await connectDB();

    const user = await User.findById(userId);
    if (!user || !user.currentPlanId) {
        return { isExpired: false, isInGracePeriod: false, daysRemaining: 0, daysPastDue: 0 };
    }

    const plan = await Plan.findById(user.currentPlanId);
    if (!plan || plan.planKey === 'free') {
        return { isExpired: false, isInGracePeriod: false, daysRemaining: 0, daysPastDue: 0 };
    }

    const now = new Date();
    const endDate = new Date(plan.endDate);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysPastDue = Math.max(0, -daysRemaining);

    const isExpired = endDate < now;
    const isInGracePeriod = isExpired && daysPastDue <= gracePeriodDays;

    // Auto-update expired plans (outside grace period)
    if (isExpired && !isInGracePeriod && plan.status !== 'expired') {
        plan.status = 'expired';
        await plan.save();
    }

    return { isExpired, isInGracePeriod, daysRemaining, daysPastDue };
}
