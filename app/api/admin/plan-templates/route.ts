import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import PlanTemplate, { IPlanTemplate } from "@/models/planTemplate";
import { planFeatures } from "@/lib/config/planFeatures";

/**
 * GET: List all plan templates (admin only)
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const basePlanKey = searchParams.get('basePlanKey');
        
        // If basePlanKey is provided, return that specific plan's features
        if (basePlanKey) {
            // First try database
            let template = await PlanTemplate.findOne({ planKey: basePlanKey.toLowerCase() }).lean() as unknown as IPlanTemplate | null;
            
            // If not in database, try planFeatures config
            if (!template) {
                const { planFeatures: planFeaturesConfig } = await import('@/lib/config/planFeatures');
                const normalizedKey = basePlanKey.toLowerCase() === 'free' ? 'free' :
                    basePlanKey.toLowerCase() === 'starter' ? 'Starter' :
                    basePlanKey.toLowerCase() === 'whatsapp automation' || basePlanKey.toLowerCase() === 'whatsapp' ? 'WhatsApp Automation' :
                    basePlanKey.toLowerCase() === 'ai whatsapp agent' || basePlanKey.toLowerCase() === 'aiagent' ? 'AI WhatsApp Agent' :
                    basePlanKey.toLowerCase() === 'pro seller' || basePlanKey.toLowerCase() === 'proseller' ? 'Pro Seller' :
                    basePlanKey.toLowerCase() === 'visionary' ? 'Visionary' : null;
                
                if (normalizedKey && planFeaturesConfig[normalizedKey as keyof typeof planFeaturesConfig]) {
                    const defaultPlans: Record<string, { name: string; description: string; icon: string; color: string; defaultPrice: number; defaultDurationDays: number }> = {
                        'free': { name: 'Free', description: 'Test all features with limited usage.', icon: 'zap', color: 'from-gray-400 to-gray-600', defaultPrice: 0, defaultDurationDays: 365 },
                        'Starter': { name: 'Starter', description: 'Basic store setup with branding and domain.', icon: 'store', color: 'from-blue-400 to-blue-600', defaultPrice: 11, defaultDurationDays: 30 },
                        'WhatsApp Automation': { name: 'WhatsApp Automation', description: 'Automate messaging with WhatsApp Cloud API.', icon: 'messagecircle', color: 'from-green-400 to-green-600', defaultPrice: 11, defaultDurationDays: 30 },
                        'AI WhatsApp Agent': { name: 'AI WhatsApp Agent', description: 'Automation + AI-powered WhatsApp assistant.', icon: 'bot', color: 'from-purple-400 to-purple-600', defaultPrice: 21, defaultDurationDays: 30 },
                        'Pro Seller': { name: 'Pro Seller', description: 'Starter + WhatsApp Automation for serious sellers.', icon: 'crown', color: 'from-yellow-400 to-orange-600', defaultPrice: 25, defaultDurationDays: 30 },
                        'Visionary': { name: 'Visionary', description: 'Pro Seller + AI Agent for full power scaling.', icon: 'sparkles', color: 'from-indigo-400 via-purple-500 to-pink-600', defaultPrice: 50, defaultDurationDays: 30 },
                    };
                    
                    const basePlanData = defaultPlans[normalizedKey];
                    return NextResponse.json({
                        template: {
                            planKey: basePlanKey.toLowerCase(),
                            name: basePlanData.name,
                            description: basePlanData.description,
                            defaultPrice: basePlanData.defaultPrice,
                            defaultDurationDays: basePlanData.defaultDurationDays,
                            features: planFeaturesConfig[normalizedKey as keyof typeof planFeaturesConfig], // Return features for frontend display only
                            icon: basePlanData.icon,
                            color: basePlanData.color,
                            isDefault: true,
                            isActive: true,
                            isCustom: false,
                            isSpecial: false,
                        }
                    });
                }
                return NextResponse.json({ error: 'Base plan not found' }, { status: 404 });
            } else {
                // Add features dynamically for database template
                const { planFeatures: planFeaturesConfig } = await import('@/lib/config/planFeatures');
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
                
                return NextResponse.json({ 
                    template: {
                        ...template,
                        features, // Add features dynamically for frontend display
                    }
                });
            }
        }

        const activeOnly = searchParams.get('activeOnly') === 'true';
        const query = activeOnly ? { isActive: true } : {};
        const templates = await PlanTemplate.find(query)
            .sort({ displayOrder: 1, createdAt: 1 })
            .lean() as unknown as IPlanTemplate[];

        // Add features dynamically to each template for frontend display
        const { planFeatures: planFeaturesConfig } = await import('@/lib/config/planFeatures');
        const templatesWithFeatures = templates.map((template) => {
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
                features, // Add features dynamically for frontend display
            };
        });

        return NextResponse.json({ templates: templatesWithFeatures });
    } catch (error: any) {
        console.error('Error fetching plan templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch plan templates' },
            { status: 500 }
        );
    }
}

/**
 * POST: Create a new plan template (admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const {
            planKey,
            name,
            description,
            defaultPrice,
            defaultDurationDays,
            features,
            icon,
            color,
            isActive,
            displayOrder,
            isSpecial,
            basePlanKey,
        } = body;

        // Validate required fields
        if (!planKey || !name || !description || defaultPrice === undefined || !defaultDurationDays) {
            return NextResponse.json(
                { error: 'Missing required fields: planKey, name, description, defaultPrice, defaultDurationDays' },
                { status: 400 }
            );
        }

        // Check if planKey already exists
        const existing = await PlanTemplate.findOne({ planKey: planKey.toLowerCase() });
        if (existing) {
            return NextResponse.json(
                { error: `Plan with key "${planKey}" already exists` },
                { status: 409 }
            );
        }

        // Validate basePlanKey for special plans and get icon/color/description
        let finalIcon = icon;
        let finalColor = color;
        let finalDescription = description;
        
        if (isSpecial && basePlanKey) {
            // Validate base plan exists and get its icon/color/description
            const defaultPlans: Record<string, { description: string; icon: string; color: string }> = {
                'free': { description: 'Test all features with limited usage.', icon: 'zap', color: 'from-gray-400 to-gray-600' },
                'starter': { description: 'Basic store setup with branding and domain.', icon: 'store', color: 'from-blue-400 to-blue-600' },
                'whatsapp automation': { description: 'Automate messaging with WhatsApp Cloud API.', icon: 'messagecircle', color: 'from-green-400 to-green-600' },
                'ai whatsapp agent': { description: 'Automation + AI-powered WhatsApp assistant.', icon: 'bot', color: 'from-purple-400 to-purple-600' },
                'pro seller': { description: 'Starter + WhatsApp Automation for serious sellers.', icon: 'crown', color: 'from-yellow-400 to-orange-600' },
                'visionary': { description: 'Pro Seller + AI Agent for full power scaling.', icon: 'sparkles', color: 'from-indigo-400 via-purple-500 to-pink-600' },
            };
            
            const normalizedBaseKey = basePlanKey.toLowerCase();
            const basePlanData = defaultPlans[normalizedBaseKey];
            
            if (!basePlanData) {
                return NextResponse.json(
                    { error: `Base plan "${basePlanKey}" not found. Please select one of: free, starter, whatsapp automation, ai whatsapp agent, pro seller, visionary` },
                    { status: 404 }
                );
            }
            
            finalIcon = basePlanData.icon;
            finalColor = basePlanData.color;
            finalDescription = basePlanData.description;
        } else if (isSpecial && !basePlanKey) {
            return NextResponse.json(
                { error: 'Base plan is required for special plans' },
                { status: 400 }
            );
        } else {
            // For non-special plans, use provided values or defaults
            finalIcon = icon || 'store';
            finalColor = color || 'from-blue-400 to-blue-600';
        }

        // Create new template (NO features stored - they are fetched dynamically)
        const template = new PlanTemplate({
            planKey: planKey.toLowerCase(),
            name,
            description: finalDescription,
            defaultPrice: parseFloat(defaultPrice),
            defaultDurationDays: parseInt(defaultDurationDays),
            icon: finalIcon,
            color: finalColor,
            isDefault: false,
            isActive: isActive !== undefined ? isActive : true,
            isCustom: !isSpecial, // Special plans are not custom (they're variants of standard plans)
            isSpecial: isSpecial === true,
            basePlanKey: isSpecial && basePlanKey ? basePlanKey.toLowerCase() : undefined,
            displayOrder: displayOrder || 0,
        });

        await template.save();

        return NextResponse.json({
            message: 'Plan template created successfully',
            template: template.toObject(),
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating plan template:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create plan template' },
            { status: 500 }
        );
    }
}

/**
 * PUT: Update a plan template (admin only)
 */
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const templateId = searchParams.get('id');

        if (!templateId) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
        }

        const body = await req.json();
        const {
            planKey,
            name,
            description,
            defaultPrice,
            defaultDurationDays,
            features,
            icon,
            color,
            isActive,
            displayOrder,
            isSpecial,
            basePlanKey,
        } = body;
        
        const template = await PlanTemplate.findById(templateId);

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // If updating to special plan, validate basePlanKey and get icon/color/description
        if (isSpecial !== undefined && isSpecial) {
            if (!basePlanKey) {
                return NextResponse.json(
                    { error: 'Base plan is required for special plans' },
                    { status: 400 }
                );
            }
            
            // Validate base plan exists and get its icon/color/description
            const defaultPlans: Record<string, { description: string; icon: string; color: string }> = {
                'free': { description: 'Test all features with limited usage.', icon: 'zap', color: 'from-gray-400 to-gray-600' },
                'starter': { description: 'Basic store setup with branding and domain.', icon: 'store', color: 'from-blue-400 to-blue-600' },
                'whatsapp automation': { description: 'Automate messaging with WhatsApp Cloud API.', icon: 'messagecircle', color: 'from-green-400 to-green-600' },
                'ai whatsapp agent': { description: 'Automation + AI-powered WhatsApp assistant.', icon: 'bot', color: 'from-purple-400 to-purple-600' },
                'pro seller': { description: 'Starter + WhatsApp Automation for serious sellers.', icon: 'crown', color: 'from-yellow-400 to-orange-600' },
                'visionary': { description: 'Pro Seller + AI Agent for full power scaling.', icon: 'sparkles', color: 'from-indigo-400 via-purple-500 to-pink-600' },
            };
            
            const normalizedBaseKey = basePlanKey.toLowerCase();
            const basePlanData = defaultPlans[normalizedBaseKey];
            
            if (!basePlanData) {
                return NextResponse.json(
                    { error: `Base plan "${basePlanKey}" not found` },
                    { status: 404 }
                );
            }
            
            template.icon = basePlanData.icon;
            template.color = basePlanData.color;
            if (!description || description === template.description) {
                template.description = basePlanData.description;
            }
        }

        // Update fields (NO features - they are fetched dynamically)
        if (name !== undefined) template.name = name;
        if (description !== undefined) template.description = description;
        if (defaultPrice !== undefined) template.defaultPrice = parseFloat(defaultPrice);
        if (defaultDurationDays !== undefined) template.defaultDurationDays = parseInt(defaultDurationDays);
        if (icon !== undefined) template.icon = icon;
        if (color !== undefined) template.color = color;
        if (isActive !== undefined) template.isActive = isActive;
        if (displayOrder !== undefined) template.displayOrder = displayOrder;
        if (isSpecial !== undefined) template.isSpecial = isSpecial;
        if (basePlanKey !== undefined) {
            template.basePlanKey = isSpecial && basePlanKey ? basePlanKey.toLowerCase() : undefined;
        }

        await template.save();

        return NextResponse.json({
            message: 'Plan template updated successfully',
            template: template.toObject(),
        });
    } catch (error: any) {
        console.error('Error updating plan template:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update plan template' },
            { status: 500 }
        );
    }
}

/**
 * DELETE: Deactivate a plan template (admin only)
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const templateId = searchParams.get('id');

        if (!templateId) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
        }

        const template = await PlanTemplate.findById(templateId);

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Don't allow deleting default plans
        if (template.isDefault) {
            return NextResponse.json(
                { error: 'Cannot delete default system plans' },
                { status: 400 }
            );
        }

        // Deactivate instead of delete
        template.isActive = false;
        await template.save();

        return NextResponse.json({
            message: 'Plan template deactivated successfully',
        });
    } catch (error: any) {
        console.error('Error deactivating plan template:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to deactivate plan template' },
            { status: 500 }
        );
    }
}
