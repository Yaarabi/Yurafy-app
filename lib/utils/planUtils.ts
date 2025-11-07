import PlanTemplate from "@/models/planTemplate";
import { planFeatures } from "@/lib/config/planFeatures";
import type { PlanFeatures } from "@/lib/config/planFeatures";

/**
 * Get plan template from database or fallback to default config
 */
export async function getPlanTemplate(planKey: string): Promise<{
    planKey: string;
    name: string;
    description: string;
    defaultPrice: number;
    defaultDurationDays: number;
    features: PlanFeatures;
    icon?: string;
    color?: string;
} | null> {
    try {
        // Try to get from database (custom/admin-created plans)
        const template = await PlanTemplate.findOne({ 
            planKey: planKey.toLowerCase(),
            isActive: true 
        }).lean();

        if (template) {
            // For special plans, get features from basePlanKey; otherwise use planKey
            const featuresKey = template.isSpecial && template.basePlanKey 
                ? template.basePlanKey 
                : template.planKey;
            
            const features = getPlanFeaturesByKey(featuresKey);
            if (!features) {
                console.error(`Features not found for plan key: ${featuresKey}`);
                return null;
            }

            return {
                planKey: template.planKey,
                name: template.name,
                description: template.description,
                defaultPrice: template.defaultPrice,
                defaultDurationDays: template.defaultDurationDays,
                features,
                icon: template.icon,
                color: template.color,
            };
        }

        // Fallback to default config
        const defaultFeatures = getPlanFeaturesByKey(planKey);
        if (defaultFeatures) {
            // Get default plan data from config
            const defaultPlans: Record<string, { name: string; price: number; description: string; icon?: string; color?: string }> = {
                'free': { name: 'Free', price: 0, description: 'Test all features with limited usage.', icon: 'zap', color: 'from-gray-400 to-gray-600' },
                'Starter': { name: 'Starter', price: 11, description: 'Basic store setup with branding and domain.', icon: 'store', color: 'from-blue-400 to-blue-600' },
                'WhatsApp Automation': { name: 'WhatsApp Automation', price: 11, description: 'Automate messaging with WhatsApp Cloud API.', icon: 'message-circle', color: 'from-green-400 to-green-600' },
                'AI WhatsApp Agent': { name: 'AI WhatsApp Agent', price: 21, description: 'Automation + AI-powered WhatsApp assistant.', icon: 'bot', color: 'from-purple-400 to-purple-600' },
                'Pro Seller': { name: 'Pro Seller', price: 25, description: 'Starter + WhatsApp Automation for serious sellers.', icon: 'crown', color: 'from-yellow-400 to-orange-600' },
                'Visionary': { name: 'Visionary', price: 50, description: 'Pro Seller + AI Agent for full power scaling.', icon: 'sparkles', color: 'from-indigo-400 via-purple-500 to-pink-600' },
            };

            const normalizedKey = planKey.toLowerCase() === 'free' ? 'free' :
                planKey.toLowerCase() === 'starter' ? 'Starter' :
                planKey.toLowerCase() === 'whatsapp automation' || planKey.toLowerCase() === 'whatsapp' ? 'WhatsApp Automation' :
                planKey.toLowerCase() === 'ai whatsapp agent' || planKey.toLowerCase() === 'aiagent' ? 'AI WhatsApp Agent' :
                planKey.toLowerCase() === 'pro seller' || planKey.toLowerCase() === 'proseller' ? 'Pro Seller' :
                planKey.toLowerCase() === 'visionary' ? 'Visionary' : planKey;

            const defaultData = defaultPlans[normalizedKey] || { name: planKey, price: 0, description: 'Custom plan' };
            return {
                planKey: planKey.toLowerCase(),
                name: defaultData.name,
                description: defaultData.description,
                defaultPrice: defaultData.price,
                defaultDurationDays: 30,
                features: defaultFeatures,
                icon: defaultData.icon,
                color: defaultData.color,
            };
        }

        return null;
    } catch (error) {
        console.error('Error getting plan template:', error);
        return null;
    }
}

/**
 * Normalize plan key (handle various input formats)
 * ✅ FIXED: Consistent normalization across all codebase
 */
export function normalizePlanKey(planKey: string): string {
    if (!planKey) return 'free';
    
    const normalized = planKey.toLowerCase().trim();
    
    const planKeyMap: Record<string, string> = {
        'starter': 'starter',
        'whatsapp': 'whatsapp automation',
        'whatsapp automation': 'whatsapp automation',
        'wa automation': 'whatsapp automation',
        'aiagent': 'ai whatsapp agent',
        'ai whatsapp agent': 'ai whatsapp agent',
        'ai agent': 'ai whatsapp agent',
        'aiwa': 'ai whatsapp agent',
        'proseller': 'pro seller',
        'pro seller': 'pro seller',
        'pro': 'pro seller',
        'visionary': 'visionary',
        'free': 'free',
    };

    // Return normalized key in lowercase for consistency
    // Special plans will be handled separately via basePlanKey
    return planKeyMap[normalized] || normalized;
}

/**
 * Get standardized plan key name (for display/API)
 */
export function getStandardPlanKey(planKey: string): string {
    const normalized = normalizePlanKey(planKey);
    
    // Map to standard display names
    const displayMap: Record<string, string> = {
        'free': 'free',
        'starter': 'starter',
        'whatsapp automation': 'whatsapp automation',
        'ai whatsapp agent': 'ai whatsapp agent',
        'pro seller': 'pro seller',
        'visionary': 'visionary',
    };
    
    return displayMap[normalized] || normalized;
}

/**
 * Get all active plan templates (for display)
 */
export async function getAllActivePlanTemplates() {
    try {
        const templates = await PlanTemplate.find({ isActive: true })
            .sort({ displayOrder: 1, createdAt: 1 })
            .lean();

        return templates;
    } catch (error) {
        console.error('Error getting active plan templates:', error);
        return [];
    }
}

/**
 * Validate plan features compatibility
 */
export function validatePlanFeatures(
    planFeatures: PlanFeatures,
    requiredFeatures: {
        needsStore?: boolean;
        needsWhatsApp?: boolean;
        needsAIAgent?: boolean;
    }
): { valid: boolean; missingFeatures: string[] } {
    const missingFeatures: string[] = [];

    if (requiredFeatures.needsStore && !planFeatures.store?.enabled) {
        missingFeatures.push('Store');
    }

    if (requiredFeatures.needsWhatsApp && !planFeatures.whatsapp?.enabled) {
        missingFeatures.push('WhatsApp');
    }

    if (requiredFeatures.needsAIAgent && !planFeatures.ai?.agent) {
        missingFeatures.push('AI Agent');
    }

    return {
        valid: missingFeatures.length === 0,
        missingFeatures,
    };
}
