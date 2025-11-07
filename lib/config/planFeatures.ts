/**
 * Plan Features Configuration
 * Defines what features are available for each plan
 */

export type PlanKey = "Starter" | "WhatsApp Automation" | "AI WhatsApp Agent" | "Pro Seller" | "Visionary" | "free";

export interface PlanFeatures {
    store: {
        enabled: boolean;
        maxProducts?: number;
        customDomain: boolean;
        customTheme: boolean;
        seo: boolean;
        analytics: boolean;
    };
    whatsapp: {
        enabled: boolean;
        automation: boolean;
        templates: boolean;
        broadcasts: boolean;
        maxContacts?: number;
    };
    ai: {
        enabled: boolean;
        agent: boolean;
        contentGeneration: boolean;
        autoResponses: boolean;
        languageSupport: string[];
    };
    orders: {
        enabled: boolean;
        maxOrders?: number;
        orderTracking: boolean;
        notifications: boolean;
    };
    analytics: {
        enabled: boolean;
        advancedReports: boolean;
        exportData: boolean;
    };
    support: {
        enabled: boolean;
        priority: boolean;
        email: boolean;
        chat: boolean;
    };
}

export const planFeatures: Record<PlanKey, PlanFeatures> = {
    free: {
        store: {
            enabled: true,
            maxProducts: 5,
            customDomain: false,
            customTheme: false,
            seo: false,
            analytics: false,
        },
        whatsapp: {
            enabled: false,
            automation: false,
            templates: false,
            broadcasts: false,
        },
        ai: {
            enabled: false,
            agent: false,
            contentGeneration: false,
            autoResponses: false,
            languageSupport: [],
        },
        orders: {
            enabled: true,
            maxOrders: 10,
            orderTracking: false,
            notifications: false,
        },
        analytics: {
            enabled: false,
            advancedReports: false,
            exportData: false,
        },
        support: {
            enabled: true,
            priority: false,
            email: false,
            chat: true,
        },
    },
    Starter: {
        store: {
            enabled: true,
            customDomain: true,
            customTheme: true,
            seo: true,
            analytics: true,
        },
        whatsapp: {
            enabled: false,
            automation: false,
            templates: false,
            broadcasts: false,
        },
        ai: {
            enabled: false,
            agent: false,
            contentGeneration: false,
            autoResponses: false,
            languageSupport: [],
        },
        orders: {
            enabled: true,
            maxOrders: 500,
            orderTracking: true,
            notifications: true,
        },
        analytics: {
            enabled: true,
            advancedReports: false,
            exportData: false,
        },
        support: {
            enabled: true,
            priority: false,
            email: true,
            chat: false,
        },
    },
    "WhatsApp Automation": {
        store: {
            enabled: false,
            maxProducts: 0,
            customDomain: false,
            customTheme: false,
            seo: false,
            analytics: false,
        },
        whatsapp: {
            enabled: true,
            automation: true,
            templates: true,
            broadcasts: true,
            maxContacts: 500,
        },
        ai: {
            enabled: false,
            agent: false,
            contentGeneration: false,
            autoResponses: false,
            languageSupport: [],
        },
        orders: {
            enabled: false,
            maxOrders: 0,
            orderTracking: false,
            notifications: false,
        },
        analytics: {
            enabled: true,
            advancedReports: false,
            exportData: false,
        },
        support: {
            enabled: true,
            priority: false,
            email: true,
            chat: false,
        },
    },
    "AI WhatsApp Agent": {
        store: {
            enabled: false,
            maxProducts: 0,
            customDomain: false,
            customTheme: false,
            seo: false,
            analytics: false,
        },
        whatsapp: {
            enabled: true,
            automation: true,
            templates: true,
            broadcasts: true,
            maxContacts: 1000,
        },
        ai: {
            enabled: true,
            agent: true,
            contentGeneration: true,
            autoResponses: true,
            languageSupport: ["en", "fr", "ar"],
        },
        orders: {
            enabled: false,
            maxOrders: 0,
            orderTracking: false,
            notifications: false,
        },
        analytics: {
            enabled: true,
            advancedReports: true,
            exportData: true,
        },
        support: {
            enabled: true,
            priority: true,
            email: true,
            chat: true,
        },
    },
    "Pro Seller": {
        store: {
            enabled: true,
            customDomain: true,
            customTheme: true,
            seo: true,
            analytics: true,
        },
        whatsapp: {
            enabled: true,
            automation: true,
            templates: true,
            broadcasts: true,
            maxContacts: 2000,
        },
        ai: {
            enabled: true,
            agent: true,
            contentGeneration: true,
            autoResponses: true,
            languageSupport: ["en", "fr", "ar"],
        },
        orders: {
            enabled: true,
            maxOrders: 1500,
            orderTracking: true,
            notifications: true,
        },
        analytics: {
            enabled: true,
            advancedReports: true,
            exportData: true,
        },
        support: {
            enabled: true,
            priority: true,
            email: true,
            chat: true,
        },
    },
    Visionary: {
        store: {
            enabled: true,
            customDomain: true,
            customTheme: true,
            seo: true,
            analytics: true,
        },
        whatsapp: {
            enabled: true,
            automation: true,
            templates: true,
            broadcasts: true,
        },
        ai: {
            enabled: true,
            agent: true,
            contentGeneration: true,
            autoResponses: true,
            languageSupport: ["en", "fr", "ar"],
        },
        orders: {
            enabled: true,
            orderTracking: true,
            notifications: true,
        },
        analytics: {
            enabled: true,
            advancedReports: true,
            exportData: true,
        },
        support: {
            enabled: true,
            priority: true,
            email: true,
            chat: true,
        },
    },
};

/**
 * Check if a feature is enabled for a plan
 */
export function hasFeature(planKey: PlanKey | null | undefined, featurePath: string): boolean {
    if (!planKey || !planFeatures[planKey]) {
        planKey = "free";
    }
    
    const features = planFeatures[planKey];
    const parts = featurePath.split('.');
    let current: any = features;
    
    for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return false;
        }
    }
    
    return current === true || current === "enabled";
}

/**
 * Get feature limit for a plan
 */
export function getFeatureLimit(planKey: PlanKey | null | undefined, featurePath: string): number | null {
    if (!planKey || !planFeatures[planKey]) {
        planKey = "free";
    }
    
    const features = planFeatures[planKey];
    const parts = featurePath.split('.');
    let current: any = features;
    
    for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return null;
        }
    }
    
    return typeof current === 'number' ? current : null;
}

