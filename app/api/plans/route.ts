import { NextRequest, NextResponse } from "next/server";
import { getAllActivePlanTemplates } from "@/lib/utils/planUtils";
import { planFeatures } from "@/lib/config/planFeatures";

/**
 * GET: Get all active plan templates (public endpoint)
 * Returns default plans only
 */
export async function GET(req: NextRequest) {
    try {
        const templates = await getAllActivePlanTemplates();

        // Add features dynamically to each template
        const templatesWithFeatures = templates.map((template: any) => {
            const featuresKey = template.planKey;
            
            const normalizedKey = featuresKey.toLowerCase() === 'free' ? 'free' :
                featuresKey.toLowerCase() === 'starter' ? 'Starter' :
                featuresKey.toLowerCase() === 'whatsapp automation' || featuresKey.toLowerCase() === 'whatsapp' ? 'WhatsApp Automation' :
                featuresKey.toLowerCase() === 'ai whatsapp agent' || featuresKey.toLowerCase() === 'aiagent' ? 'AI WhatsApp Agent' :
                featuresKey.toLowerCase() === 'pro seller' || featuresKey.toLowerCase() === 'proseller' ? 'Pro Seller' :
                featuresKey.toLowerCase() === 'visionary' ? 'Visionary' : null;
            
            const features = normalizedKey && planFeatures[normalizedKey as keyof typeof planFeatures] 
                ? planFeatures[normalizedKey as keyof typeof planFeatures] 
                : null;
            
            return {
                ...template,
                features, // Add features dynamically
            };
        });

        return NextResponse.json({ 
            plans: templatesWithFeatures,
            planTemplates: templatesWithFeatures,
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

