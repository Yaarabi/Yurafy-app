import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import WhatsAppAccount from "@/models/whatsappAccount";
import AIAgent from "@/models/ai-agent";
import Template from "@/models/templates";
import Plan from "@/models/plan";

/**
 * GET /api/user/whatsapp-data
 * Returns consolidated WhatsApp account, AI agent, templates, and plan data for the authenticated user
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        const userId = session.user.id;

        // Fetch all data in parallel
        const [user, whatsappAccount, aiAgent, templates] = await Promise.all([
            User.findById(userId).select('currentPlanId').lean(),
            WhatsAppAccount.findOne({ owner: userId }).lean(),
            AIAgent.findOne({ owner: userId }).lean(),
            Template.find({ owner: userId }).lean()
        ]);

        // Fetch current plan if user has one
        let currentPlan: any = null;
        let planKey = "free";

        const userData = user as any;
        if (userData?.currentPlanId) {
            currentPlan = await Plan.findOne({
                _id: userData.currentPlanId,
                status: "active"
            }).lean();

            const planData = currentPlan as any;
            if (planData?.planKey) {
                planKey = planData.planKey;
            }
        }

        // Determine AI Agent access
        const hasAIAgentAccess = 
            planKey === "AI WhatsApp Agent" || 
            planKey === "Pro Seller" || 
            planKey === "Visionary";

        return NextResponse.json({
            success: true,
            data: {
                whatsappAccount: whatsappAccount || null,
                aiAgent: aiAgent || null,
                templates: templates || [],
                plan: {
                    planKey,
                    hasAIAgentAccess,
                    currentPlan
                }
            }
        });
    } catch (error) {
        console.error("Error fetching WhatsApp data:", error);
        return NextResponse.json(
            { error: "Failed to fetch WhatsApp data" },
            { status: 500 }
        );
    }
}
