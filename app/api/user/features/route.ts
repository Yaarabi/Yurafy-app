import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import User, { IUser } from "@/models/users";
import Store, { IStore } from "@/models/store";
import WhatsAppAccount, { IWhatsAppAccount } from "@/models/whatsappAccount";
import AIAgent, { IAIAgent } from "@/models/ai-agent";
import Product from "@/models/products";
import Order from "@/models/orders";
import Plan, { IPlan } from "@/models/plan";
import Template from "@/models/templates";

/**
 * GET /api/user/features
 * Returns all user features data in one call:
 * - User info
 * - Store (if exists)
 * - WhatsApp account (if exists)
 * - AI Agent (if exists)
 * - Plan info
 * - Statistics (orders, products, revenue, etc.)
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch all user data in parallel
        const [
            user,
            store,
            whatsappAccount,
            aiAgent,
        ] = await Promise.all([
            User.findById(userId).select("-password").lean<IUser>(),
            Store.findOne({ owner: userId }).lean<IStore>(),
            WhatsAppAccount.findOne({ owner: userId }).lean<IWhatsAppAccount>(),
            AIAgent.findOne({ owner: userId }).lean<IAIAgent>(),
        ]);

        // Get current active plan (check user.currentPlanId first, then find active plans)
        let currentPlan: IPlan | null = null;
        if (user && user.currentPlanId) {
            currentPlan = await Plan.findById(user.currentPlanId).lean<IPlan>();
            // If plan exists but is not active or expired, check for other active plans
            if (currentPlan && (currentPlan.status !== 'active' || new Date(currentPlan.endDate) < new Date())) {
                // Look for the most recent active plan
                const activePlan = await Plan.findOne({ 
                    userId: userId,
                    status: 'active',
                    endDate: { $gte: new Date() }
                }).sort({ createdAt: -1 }).lean() as IPlan | null;
                if (activePlan) {
                    currentPlan = activePlan;
                }
            }
        } else {
            // If no currentPlanId, try to find any active plan
            currentPlan = await Plan.findOne({ 
                userId: userId,
                status: 'active',
                endDate: { $gte: new Date() }
            }).sort({ createdAt: -1 }).lean() as IPlan | null;
        }

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get statistics based on user's plan and features
        const [productsCount, ordersCount, templatesCount] = await Promise.all([
            Product.countDocuments({ owner: userId }),
            Order.countDocuments({ owner: userId }),
            Template.countDocuments({ owner: userId }),
        ]);

        // Calculate revenue and order statistics
        const orders = await Order.find({ owner: userId }).lean();
        const totalRevenue = orders.reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);
        const ordersByStatus = orders.reduce((acc: any, order: any) => {
            const status = order.status || 'pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Calculate revenue by date (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentOrders = orders.filter((order: any) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= thirtyDaysAgo;
        });

        const revenueByDate = recentOrders.reduce((acc: any, order: any) => {
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + (order.totalAmount || 0);
            return acc;
        }, {});

        // Calculate top products by sales
        const topProducts = await Product.find({ owner: userId })
            .sort({ salesCount: -1 })
            .limit(5)
            .select('name price salesCount')
            .lean();

        // Determine plan features - check if plan is active and not expired
        let planKey = 'free';
        if (currentPlan && currentPlan.status === 'active' && new Date(currentPlan.endDate) >= new Date()) {
            planKey = currentPlan.planKey || 'free';
        } else if (user && user.currentPlanId && !currentPlan) {
            // If user has currentPlanId but plan not found or expired, default to free
            planKey = 'free';
        } else {
            // Fallback to user.plan if no active plan found
            planKey = (user as any)?.plan || 'free';
        }

        // Normalize planKey to lowercase for comparison
        const normalizedPlanKeyForCheck = planKey.toLowerCase();
        const isStorePlan = ['starter', 'proseller', 'pro seller', 'visionary'].includes(normalizedPlanKeyForCheck);
        const isWhatsAppPlan = ['whatsapp automation', 'whatsapp', 'ai whatsapp agent', 'aiagent', 'ai agent', 'proseller', 'pro seller', 'visionary'].includes(normalizedPlanKeyForCheck);
        const hasOrders = planKey.toLowerCase() !== 'free';

        // Get plan limits from plan features config
        type PlanLimits = {
            maxProducts: number | undefined;
            maxOrders: number | undefined;
            maxContacts: number | undefined;
        };
        
        let planLimits: PlanLimits = {
            maxProducts: undefined,
            maxOrders: undefined,
            maxContacts: undefined,
        };

        try {
            const planFeaturesModule = await import('@/lib/config/planFeatures');
            // planFeatures is a named export, not default
            const planFeatures = planFeaturesModule.planFeatures;
            
            if (!planFeatures) {
                console.error('planFeatures not found in module');
            } else {
                // Normalize planKey to match planFeatures keys
                // Convert lowercase 'free', 'starter', etc. to proper case
                let normalizedPlanKey: string = planKey;
                
                // Map common variations to correct keys
                const planKeyMap: Record<string, string> = {
                    'free': 'free',
                    'starter': 'Starter',
                    'whatsapp': 'WhatsApp Automation',
                    'whatsapp automation': 'WhatsApp Automation',
                    'aiagent': 'AI WhatsApp Agent',
                    'ai whatsapp agent': 'AI WhatsApp Agent',
                    'ai agent': 'AI WhatsApp Agent',
                    'proseller': 'Pro Seller',
                    'pro seller': 'Pro Seller',
                    'visionary': 'Visionary',
                };
                
                const lowerPlanKey = planKey.toLowerCase();
                if (planKeyMap[lowerPlanKey]) {
                    normalizedPlanKey = planKeyMap[lowerPlanKey];
                }
                
                // Try to get features for the normalized key, fallback to 'free'
                const features = planFeatures[normalizedPlanKey as keyof typeof planFeatures] 
                    || planFeatures['free' as keyof typeof planFeatures]
                    || planFeatures.free;
                
                if (features) {
                    planLimits = {
                        maxProducts: features.store?.maxProducts,
                        maxOrders: features.orders?.maxOrders,
                        maxContacts: features.whatsapp?.maxContacts,
                    };
                }
            }
        } catch (error) {
            console.error('Error loading plan features:', error);
            // Keep default planLimits (all undefined)
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                logo: user.logo,
                role: user.role,
                plan: planKey, // Return the actual current plan key, not the old user.plan field
                active: user.active,
                onboardingCompleted: user.onboardingCompleted,
            },
            features: {
                store: store || null,
                whatsapp: whatsappAccount || null,
                aiAgent: aiAgent || null,
            },
            plan: {
                planKey,
                currentPlan: currentPlan ? {
                    planKey: currentPlan.planKey,
                    planName: currentPlan.planKey, // For backward compatibility
                    startDate: currentPlan.startDate,
                    endDate: currentPlan.endDate,
                    status: currentPlan.status,
                } : null,
                limits: planLimits,
                usage: {
                    products: productsCount,
                    orders: ordersCount,
                    contacts: 0, // TODO: Calculate from WhatsApp contacts if available
                },
            },
            statistics: {
                totalRevenue,
                productsCount,
                ordersCount,
                templatesCount,
                ordersByStatus,
                revenueByDate,
                topProducts,
                recentOrders: recentOrders.slice(0, 10), // Last 10 orders
            },
            planFeatures: {
                hasStore: !!store,
                hasWhatsApp: !!whatsappAccount,
                hasAIAgent: !!aiAgent,
                isStorePlan,
                isWhatsAppPlan,
                hasOrders,
            },
        });
    } catch (error) {
        console.error('Error fetching user features:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user features' },
            { status: 500 }
        );
    }
}
