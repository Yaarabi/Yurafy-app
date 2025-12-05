import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import PlanTemplate from "@/models/planTemplate";

/**
 * GET: Get all active plan templates (public endpoint)
 * Returns both regular and special plans
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const includeSpecial = searchParams.get('includeSpecial') !== 'false'; // Default: true

        // Fetch active plans
        const query: any = { isActive: true };
        if (!includeSpecial) {
            query.isSpecial = { $ne: true };
        }

        const templates = await PlanTemplate.find(query)
            .sort({ displayOrder: 1, createdAt: 1 })
            .lean();

        // Add features dynamically to each template
        const { planFeatures: planFeaturesConfig } = await import('@/lib/config/planFeatures');
        const templatesWithFeatures = templates.map((template: any) => {
            // For special plans, get features from basePlanKey; otherwise use planKey
            const featuresKey = template.isSpecial && template.basePlanKey 
                ? template.basePlanKey 
                : template.planKey;
            
            const normalizedKey = featuresKey.toLowerCase() === 'free' ? 'free' :
                featuresKey.toLowerCase() === 'starter' ? 'Starter' :
                featuresKey.toLowerCase() === 'whatsapp automation' || featuresKey.toLowerCase() === 'whatsapp' ? 'WhatsApp Automation' :
                featuresKey.toLowerCase() === 'ai whatsapp agent' || featuresKey.toLowerCase() === 'aiagent' ? 'AI WhatsApp Agent' :
                featuresKey.toLowerCase() === 'pro seller' || featuresKey.toLowerCase() === 'proseller' ? 'Pro Seller' :
                featuresKey.toLowerCase() === 'visionary' ? 'Visionary' : null;
            
            const features = normalizedKey && planFeaturesConfig[normalizedKey as keyof typeof planFeaturesConfig] 
                ? planFeaturesConfig[normalizedKey as keyof typeof planFeaturesConfig] 
                : null;
            
            return {
                ...template,
                features, // Add features dynamically
            };
        });

        // Separate regular and special plans
        const regularPlans = templatesWithFeatures.filter((t: any) => !t.isSpecial);
        const specialPlans = templatesWithFeatures.filter((t: any) => t.isSpecial);

        return NextResponse.json({ 
            plans: regularPlans,
            specialPlans: specialPlans,
            all: templatesWithFeatures
        }, {
            headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            },
        });
    } catch (error: any) {
        console.error('Error fetching plans:', error);
        return NextResponse.json(
            { error: 'Failed to fetch plans' },
            { status: 500 }
        );
    }
}

