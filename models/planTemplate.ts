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
    icon?: string; // Icon identifier (e.g., "store", "message-circle", "bot")
    color?: string; // CSS gradient class
    isDefault: boolean; // Whether this is a default system plan
    isActive: boolean; // Whether this plan is available for selection
    isCustom: boolean; // Whether this is a custom admin-created plan
    isSpecial: boolean; // Whether this is a special plan (different pricing/duration from base plan)
    basePlanKey?: string; // If isSpecial=true, this links to the base plan template (features fetched from base plan)
    displayOrder: number; // Order in which plans are displayed
    createdAt: Date;
    updatedAt: Date;
    // Features are NOT stored in database - they are fetched dynamically based on planKey or basePlanKey
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
        isSpecial: {
            type: Boolean,
            default: false,
            index: true,
        },
        basePlanKey: {
            type: String,
            lowercase: true,
            trim: true,
            index: true,
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
