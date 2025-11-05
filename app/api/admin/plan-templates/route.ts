import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import PlanTemplate from "@/models/planTemplate";
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
        const activeOnly = searchParams.get('activeOnly') === 'true';

        const query = activeOnly ? { isActive: true } : {};
        const templates = await PlanTemplate.find(query)
            .sort({ displayOrder: 1, createdAt: 1 })
            .lean();

        return NextResponse.json({ templates });
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

        // Create new template
        const template = new PlanTemplate({
            planKey: planKey.toLowerCase(),
            name,
            description,
            defaultPrice: parseFloat(defaultPrice),
            defaultDurationDays: parseInt(defaultDurationDays),
            features: features || {
                store: { enabled: false, maxProducts: null, customDomain: false, customTheme: false, customCSS: false, customJS: false, seo: false, analytics: false },
                whatsapp: { enabled: false, automation: false, templates: false, broadcasts: false, maxContacts: null },
                ai: { enabled: false, agent: false, contentGeneration: false, autoResponses: false, languageSupport: [] },
                orders: { enabled: false, maxOrders: null, orderTracking: false, notifications: false },
                analytics: { enabled: false, advancedReports: false, exportData: false },
                support: { enabled: false, priority: false, email: false, chat: false },
            },
            icon: icon || 'store',
            color: color || 'from-blue-400 to-blue-600',
            isDefault: false,
            isActive: isActive !== undefined ? isActive : true,
            isCustom: true,
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
        const template = await PlanTemplate.findById(templateId);

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Update fields
        if (body.name !== undefined) template.name = body.name;
        if (body.description !== undefined) template.description = body.description;
        if (body.defaultPrice !== undefined) template.defaultPrice = parseFloat(body.defaultPrice);
        if (body.defaultDurationDays !== undefined) template.defaultDurationDays = parseInt(body.defaultDurationDays);
        if (body.features !== undefined) template.features = body.features;
        if (body.icon !== undefined) template.icon = body.icon;
        if (body.color !== undefined) template.color = body.color;
        if (body.isActive !== undefined) template.isActive = body.isActive;
        if (body.displayOrder !== undefined) template.displayOrder = body.displayOrder;

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
