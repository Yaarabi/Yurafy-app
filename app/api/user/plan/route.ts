import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import User, { IUser } from "@/models/users";
import Plan from "@/models/support/plan";
import Product from "@/models/store/products";
import Order from "@/models/store/orders";
import WhatsAppAccount from "@/models/automation/whatsappAccount";
import { planFeatures } from "@/lib/config/planFeatures";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(session.user.id).lean<IUser>();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let planKey = "free";
        let planStatus: "active" | "expired" | "cancelled" = "expired";
        let startDate = new Date();
        let endDate = new Date();
        let daysRemaining = 0;
        let isExpired = true;

        if (user.currentPlanId) {
            const plan = await Plan.findById(user.currentPlanId).lean();
            if (plan && !Array.isArray(plan)) {
                planKey = plan.planKey as string;
                planStatus = plan.status as "active" | "expired" | "cancelled";
                startDate = plan.startDate;
                endDate = plan.endDate;

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
        const [productsCount, ordersCount, whatsappCount] = await Promise.all([
            user._id ? Product.countDocuments({ owner: user._id }) : 0,
            user._id ? Order.countDocuments({ owner: user._id }) : 0,
            user._id ? WhatsAppAccount.countDocuments({ userId: user._id }) : 0,
        ]);

        // Get WhatsApp contacts count if WhatsApp account exists
        let contactsCount = 0;
        if (user._id) {
            const waAccount = await WhatsAppAccount.findOne({ userId: user._id }).lean();
            // contactsCount = waAccount?.contacts?.length || 0;
        }

        const usage = {
            products: productsCount,
            orders: ordersCount,
            contacts: contactsCount,
        };

        return NextResponse.json({
            planKey,
            status: planStatus,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            daysRemaining,
            isExpired,
            limits,
            usage,
        });
    } catch (error) {
        console.error("Error fetching user plan:", error);
        return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
    }
}

