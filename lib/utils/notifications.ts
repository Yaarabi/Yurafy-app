/**
 * Notification Utility Functions
 * Helper functions for creating and managing notifications
 */

import { connectDB } from "@/lib/db/mongoDB";
import Notification from "@/models/notification";
import mongoose from "mongoose";

export type NotificationType = 
    | 'support_reply' 
    | 'order_update' 
    | 'plan_expiry' 
    | 'plan_warning' 
    | 'plan_limit_reached'
    | 'plan_subscription'
    | 'welcome'
    | 'system' 
    | 'admin_message';

/**
 * Create a notification for a user
 */
export async function createNotification(
    ownerId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    metadata?: any
): Promise<void> {
    try {
        await connectDB();
        
        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            console.error(`Invalid ownerId: ${ownerId}`);
            return;
        }

        await Notification.create({
            owner: new mongoose.Types.ObjectId(ownerId),
            type: type as any, // Type assertion for enum compatibility
            title,
            message,
            link,
            metadata,
            read: false,
        });
    } catch (error) {
        console.error(`Error creating notification for user ${ownerId}:`, error);
        // Don't throw - notifications are non-critical
    }
}

/**
 * Create welcome notification for new users
 */
export async function createWelcomeNotification(userId: string, username: string): Promise<void> {
    await createNotification(
        userId,
        'welcome',
        'Welcome to Yura SaaS! 🎉',
        `Hi ${username}! Welcome to Yura SaaS. We're excited to have you on board. Start by setting up your store and exploring all the amazing features we have to offer.`,
        '/dashboard',
        { username }
    );
}

/**
 * Create thank you notification for plan subscription
 */
export async function createSubscriptionNotification(
    userId: string,
    planKey: string,
    planName: string
): Promise<void> {
    const isVisionary = planKey.toLowerCase() === 'visionary';
    const message = isVisionary
        ? `Thank you for subscribing to the ${planName} plan! 🚀 You now have access to all premium features including unlimited products, orders, contacts, AI agent, and priority support. Enjoy your journey with us!`
        : `Thank you for subscribing to the ${planName} plan! 🎉 Your subscription is now active. You can start using all the features included in your plan.`;

    await createNotification(
        userId,
        'plan_subscription',
        `Thank you for subscribing! ${isVisionary ? '🚀' : '🎉'}`,
        message,
        '/dashboard/settings',
        { planKey, planName }
    );
}

/**
 * Create plan expiration reminder notification
 */
export async function createPlanExpiryNotification(
    userId: string,
    planKey: string,
    daysRemaining: number
): Promise<void> {
    const message = daysRemaining <= 0
        ? `Your ${planKey} plan has expired. Please renew your subscription to continue using premium features.`
        : `Your ${planKey} plan will expire in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Please renew your subscription to avoid service interruption.`;

    await createNotification(
        userId,
        daysRemaining <= 0 ? 'plan_expiry' : 'plan_warning',
        daysRemaining <= 0 ? 'Plan Expired ⚠️' : `Plan Expiring Soon (${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left)`,
        message,
        '/dashboard/settings',
        { planKey, daysRemaining }
    );
}

/**
 * Create plan limit reached notification
 */
export async function createPlanLimitNotification(
    userId: string,
    limitType: 'products' | 'orders' | 'contacts',
    currentUsage: number,
    limit: number
): Promise<void> {
    const limitTypeNames = {
        products: 'Products',
        orders: 'Orders',
        contacts: 'Contacts',
    };

    const limitName = limitTypeNames[limitType];

    await createNotification(
        userId,
        'plan_limit_reached',
        `${limitName} Limit Reached ⚠️`,
        `You've reached your plan limit of ${limit} ${limitName.toLowerCase()}. You're currently using ${currentUsage} ${limitName.toLowerCase()}. Please upgrade your plan to continue adding more ${limitName.toLowerCase()}.`,
        '/dashboard/settings',
        { limitType, currentUsage, limit }
    );
}

