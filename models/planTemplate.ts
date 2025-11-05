import mongoose from "mongoose";

/**
 * PlanTemplate - Admin-managed plan templates
 * Allows admins to create custom plans with special durations and pricing
 */
export interface IPlanTemplate {
    _id: string;
    planKey: string; // Unique identifier (e.g., "starter", "whatsapp", "custom-plan-1")
    name: string; // Display name (e.g., "Starter", "WhatsApp Automation")
    description: string;
    defaultPrice: number; // Default price (can be overridden per user)
    defaultDurationDays: number; // Default duration (can be overridden per user)
    features: {
        store: {
            enabled: boolean;
            maxProducts?: number;
            customDomain: boolean;
            customTheme: boolean;
            customCSS: boolean;
            customJS: boolean;
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
    };
    icon?: string; // Icon identifier (e.g., "store", "message-circle", "bot")
    color?: string; // CSS gradient class
    isDefault: boolean; // Whether this is a default system plan
    isActive: boolean; // Whether this plan is available for selection
    isCustom: boolean; // Whether this is a custom admin-created plan
    displayOrder: number; // Order in which plans are displayed
    createdAt: Date;
    updatedAt: Date;
}

const planTemplateSchema = new mongoose.Schema<IPlanTemplate>(
    {
        planKey: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        defaultPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        defaultDurationDays: {
            type: Number,
            required: true,
            min: 1,
            default: 30,
        },
        features: {
            store: {
                enabled: { type: Boolean, default: false },
                maxProducts: { type: Number, default: null },
                customDomain: { type: Boolean, default: false },
                customTheme: { type: Boolean, default: false },
                customCSS: { type: Boolean, default: false },
                customJS: { type: Boolean, default: false },
                seo: { type: Boolean, default: false },
                analytics: { type: Boolean, default: false },
            },
            whatsapp: {
                enabled: { type: Boolean, default: false },
                automation: { type: Boolean, default: false },
                templates: { type: Boolean, default: false },
                broadcasts: { type: Boolean, default: false },
                maxContacts: { type: Number, default: null },
            },
            ai: {
                enabled: { type: Boolean, default: false },
                agent: { type: Boolean, default: false },
                contentGeneration: { type: Boolean, default: false },
                autoResponses: { type: Boolean, default: false },
                languageSupport: { type: [String], default: [] },
            },
            orders: {
                enabled: { type: Boolean, default: false },
                maxOrders: { type: Number, default: null },
                orderTracking: { type: Boolean, default: false },
                notifications: { type: Boolean, default: false },
            },
            analytics: {
                enabled: { type: Boolean, default: false },
                advancedReports: { type: Boolean, default: false },
                exportData: { type: Boolean, default: false },
            },
            support: {
                enabled: { type: Boolean, default: false },
                priority: { type: Boolean, default: false },
                email: { type: Boolean, default: false },
                chat: { type: Boolean, default: false },
            },
        },
        icon: {
            type: String,
            default: "store",
        },
        color: {
            type: String,
            default: "from-blue-400 to-blue-600",
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        isCustom: {
            type: Boolean,
            default: false,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Index for active plans
planTemplateSchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.models.PlanTemplate || mongoose.model<IPlanTemplate>("PlanTemplate", planTemplateSchema);
