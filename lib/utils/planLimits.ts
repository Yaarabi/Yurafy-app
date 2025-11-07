/**
 * Plan Limits Utility Functions
 * Helper functions for checking plan limits and deactivating features
 */

import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import Plan from "@/models/plan";
import Product from "@/models/products";
import Order from "@/models/orders";
import WhatsAppAccount from "@/models/whatsappAccount";
import AIAgent from "@/models/ai-agent";
import Store from "@/models/store";
import { planFeatures } from "@/lib/config/planFeatures";
import { createPlanLimitNotification } from "./notifications";

/**
 * Check if user has reached a plan limit
 */
export async function checkPlanLimit(
    userId: string,
    limitType: 'products' | 'orders' | 'contacts'
): Promise<{ hasReachedLimit: boolean; currentUsage: number; limit: number | null }> {
    await connectDB();

    const user = await User.findById(userId);
    if (!user || !user.currentPlanId) {
        return { hasReachedLimit: false, currentUsage: 0, limit: null };
    }

    const plan = await Plan.findById(user.currentPlanId);
    if (!plan) {
        return { hasReachedLimit: false, currentUsage: 0, limit: null };
    }

    const planKey = plan.planKey as keyof typeof planFeatures;
    const features = planFeatures[planKey] || planFeatures.free;

    let currentUsage = 0;
    let limit: number | null = null;

    switch (limitType) {
        case 'products':
            currentUsage = await Product.countDocuments({ owner: userId });
            limit = features.store?.maxProducts || null;
            break;
        case 'orders':
            currentUsage = await Order.countDocuments({ owner: userId });
            limit = features.orders?.maxOrders || null;
            break;
        case 'contacts':
            const waAccount = await WhatsAppAccount.findOne({ owner: userId });
            // For contacts, we might need to count from conversations or contacts array
            // This is a placeholder - adjust based on your actual data structure
            currentUsage = 0; // TODO: Implement actual contact count
            limit = features.whatsapp?.maxContacts || null;
            break;
    }

    const hasReachedLimit = limit !== null && currentUsage >= limit;

    return { hasReachedLimit, currentUsage, limit };
}

/**
 * Deactivate features when plan limits are reached
 */
export async function deactivateFeaturesOnLimitReached(userId: string): Promise<void> {
    await connectDB();

    const user = await User.findById(userId);
    if (!user || !user.currentPlanId) {
        return;
    }

    const plan = await Plan.findById(user.currentPlanId);
    if (!plan) {
        return;
    }

    const planKey = plan.planKey as keyof typeof planFeatures;
    const features = planFeatures[planKey] || planFeatures.free;

    // Check products limit
    if (features.store?.maxProducts !== undefined) {
        const productsCount = await Product.countDocuments({ owner: userId });
        if (productsCount >= features.store.maxProducts) {
            // Deactivate all products beyond the limit
            const products = await Product.find({ owner: userId })
                .sort({ createdAt: -1 })
                .skip(features.store.maxProducts);
            
            for (const product of products) {
                product.enabled = false;
                await product.save();
            }

            // Send notification if not already sent recently
            await createPlanLimitNotification(userId, 'products', productsCount, features.store.maxProducts);
        }
    }

    // Check orders limit
    if (features.orders?.maxOrders !== undefined) {
        const ordersCount = await Order.countDocuments({ owner: userId });
        if (ordersCount >= features.orders.maxOrders) {
            // Note: We typically don't deactivate orders, but we can prevent new ones
            // Send notification
            await createPlanLimitNotification(userId, 'orders', ordersCount, features.orders.maxOrders);
        }
    }

    // Check WhatsApp contacts limit
    if (features.whatsapp?.maxContacts !== undefined) {
        const waAccount = await WhatsAppAccount.findOne({ owner: userId });
        if (waAccount) {
            // TODO: Implement actual contact count check
            // For now, we'll just check if the feature should be disabled
            if (features.whatsapp.maxContacts === 0) {
                waAccount.active = false;
                await waAccount.save();
            }
        }
    }

    // Deactivate AI Agent if not in plan
    if (!features.ai?.agent) {
        const aiAgent = await AIAgent.findOne({ owner: userId });
        if (aiAgent) {
            aiAgent.active = false;
            aiAgent.enabled = false;
            await aiAgent.save();
        }
    }

    // Deactivate Store if not in plan
    if (!features.store?.enabled) {
        const stores = await Store.find({ owner: userId });
        for (const store of stores) {
            store.active = false;
            await store.save();
        }
    }
}

/**
 * Check if user can perform an action based on plan limits
 */
export async function canPerformAction(
    userId: string,
    actionType: 'create_product' | 'create_order' | 'add_contact'
): Promise<{ allowed: boolean; reason?: string }> {
    await connectDB();

    const user = await User.findById(userId);
    if (!user || !user.currentPlanId) {
        return { allowed: false, reason: 'User or plan not found' };
    }

    const plan = await Plan.findById(user.currentPlanId);
    if (!plan) {
        return { allowed: false, reason: 'Plan not found' };
    }

    const planKey = plan.planKey as keyof typeof planFeatures;
    const features = planFeatures[planKey] || planFeatures.free;

    switch (actionType) {
        case 'create_product':
            if (!features.store?.enabled) {
                return { allowed: false, reason: 'Store feature is not enabled in your plan' };
            }
            if (features.store.maxProducts !== undefined) {
                const productsCount = await Product.countDocuments({ owner: userId });
                if (productsCount >= features.store.maxProducts) {
                    return { 
                        allowed: false, 
                        reason: `You've reached your plan limit of ${features.store.maxProducts} products. Please upgrade your plan.` 
                    };
                }
            }
            break;

        case 'create_order':
            if (!features.orders?.enabled) {
                return { allowed: false, reason: 'Orders feature is not enabled in your plan' };
            }
            if (features.orders.maxOrders !== undefined) {
                const ordersCount = await Order.countDocuments({ owner: userId });
                if (ordersCount >= features.orders.maxOrders) {
                    return { 
                        allowed: false, 
                        reason: `You've reached your plan limit of ${features.orders.maxOrders} orders. Please upgrade your plan.` 
                    };
                }
            }
            break;

        case 'add_contact':
            if (!features.whatsapp?.enabled) {
                return { allowed: false, reason: 'WhatsApp feature is not enabled in your plan' };
            }
            if (features.whatsapp.maxContacts !== undefined) {
                // TODO: Implement actual contact count check
                // For now, we'll just check if the feature is enabled
            }
            break;
    }

    return { allowed: true };
}

