import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import Plan, { IPlan } from "@/models/plan";
import Store from "@/models/store";
import Product from "@/models/products";
import Order from "@/models/orders";
import WhatsAppAccount from "@/models/whatsappAccount";
import { planFeatures } from "@/lib/config/planFeatures";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get all users with their plans, excluding admin users
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password').lean();
        
        const usersWithPlans = await Promise.all(
            users.map(async (user: any) => {
                let planKey = "free";
                let planStatus: "active" | "expired" | "cancelled" = "expired";
                let startDate = new Date();
                let endDate = new Date();
                let daysRemaining = 0;
                let isExpired = true;

                if (user.currentPlanId) {
                    const planDoc = await Plan.findById(user.currentPlanId).lean<IPlan>();
                    if (planDoc && !Array.isArray(planDoc)) {
                        const plan = planDoc as IPlan;
                        planKey = plan.planKey as string;
                        planStatus = plan.status as "active" | "expired" | "cancelled";
                        startDate = new Date(plan.startDate);
                        endDate = new Date(plan.endDate);
                        
                        const now = new Date();
                        isExpired = planStatus === "expired" || planStatus === "cancelled" || endDate < now;
                        daysRemaining = isExpired 
                            ? 0 
                            : Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    }
                }

                // Get plan limits
                const features = planFeatures[planKey as keyof typeof planFeatures] || planFeatures.free;
                const limits = {
                    maxProducts: features.store?.maxProducts,
                    maxOrders: features.orders?.maxOrders,
                    maxContacts: features.whatsapp?.maxContacts,
                };

                // Get usage
                const userId = user._id?.toString ? user._id.toString() : String(user._id || '');
                const userObjectId = user._id;
                
                const [productsCount, ordersCount, whatsappCount] = await Promise.all([
                    userObjectId ? Product.countDocuments({ owner: userObjectId }) : 0,
                    userObjectId ? Order.countDocuments({ owner: userObjectId }) : 0,
                    userObjectId ? WhatsAppAccount.countDocuments({ userId: userObjectId }) : 0,
                ]);

                // Get WhatsApp contacts count if WhatsApp account exists
                let contactsCount = 0;
                if (userObjectId) {
                    const waAccount = await WhatsAppAccount.findOne({ userId: userObjectId }).lean();
                    // Note: You may need to adjust this based on your WhatsAppAccount schema
                    // contactsCount = waAccount?.contacts?.length || 0;
                }

                const usage = {
                    products: productsCount,
                    orders: ordersCount,
                    contacts: contactsCount,
                };

                return {
                    userId: userId || '',
                    username: user.username || '',
                    email: user.email || '',
                    planKey,
                    status: planStatus,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    daysRemaining,
                    isExpired,
                    limits,
                    usage,
                };
            })
        );

        return NextResponse.json({ users: usersWithPlans });
    } catch (error) {
        console.error('Admin user plans error:', error);
        return NextResponse.json({ error: 'Failed to fetch user plans' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        await connectDB();

        const body = await req.json();
        const { planKey, durationDays, status } = body;

        // Get user
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update or create plan
        if (user.currentPlanId) {
            const plan = await Plan.findById(user.currentPlanId);
            if (plan) {
                if (planKey) plan.planKey = planKey;
                if (status) plan.status = status;
                if (durationDays) {
                    const startDate = plan.startDate;
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + durationDays);
                    plan.endDate = endDate;
                    plan.durationDays = durationDays;
                }
                await plan.save();
            }
        } else if (planKey) {
            // Create new plan
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + (durationDays || 30));

            const newPlan = new Plan({
                userId: user._id,
                planKey,
                price: 0,
                durationDays: durationDays || 30,
                startDate,
                endDate,
                status: status || "active",
            });

            const savedPlan = await newPlan.save();
            user.currentPlanId = savedPlan._id;
            await user.save();
        }

        return NextResponse.json({ message: 'Plan updated successfully' });
    } catch (error) {
        console.error('Admin update plan error:', error);
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }
}

