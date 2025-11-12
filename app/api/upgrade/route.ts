import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import Store from "@/models/store";
import WhatsAppAccount from "@/models/whatsappAccount";
import AIAgent from "@/models/ai-agent";
import crypto from "crypto";
import { getPlanTemplate, normalizePlanKey } from "@/lib/utils/planUtils";

// ------------------------
// Encrypt WhatsApp token
// ------------------------
function encryptToken(token: string) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        "aes-256-ctr",
        Buffer.from(process.env.ENCRYPTION_KEY!, "hex"),
        iv
    );
    const encrypted = Buffer.concat([cipher.update(token), cipher.final()]);    
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

// ------------------------
// Generate a random webhook verify token
// ------------------------
function generateWebhookVerifyToken(): string {
    // Generate a secure random token (6 bytes = 12 hex characters)
    return crypto.randomBytes(6).toString('hex');
}

// ------------------------
// POST: Handle upgrade logic
// ------------------------
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });                                                                               
        }

        let planKey: string | undefined;
        let locale: string = 'en';

        // Parse JSON body safely and return a helpful error if parsing fails
        try {
            const body = await req.json();
            planKey = body?.planKey;
            locale = body?.locale || 'en';
        } catch (err) {
            console.error('[Upgrade] Failed to parse request body:', err);
            return NextResponse.json({ error: 'Invalid or missing JSON body' }, { status: 400 });
        }

        if (!planKey) {
            return NextResponse.json({ error: "Plan key is required" }, { status: 400 });                                                                        
        }

        const userId = session.user.id;
        
        // Normalize plan key
        const normalizedPlanKey = normalizePlanKey(planKey);
        
        // ✅ FIXED: Validate plan from database (including special plans)
        const planTemplate = await getPlanTemplate(normalizedPlanKey);
        if (!planTemplate) {
            return NextResponse.json({ 
                error: `The plan "${planKey}" is not available or has been removed. Please select a different plan from the plan selection page.`,
                code: 'PLAN_NOT_FOUND'
            }, { status: 400 });
        }

        // ✅ FIXED: Prevent downgrades with user-friendly error message
        const User = (await import('@/models/users')).default;
        const Plan = (await import('@/models/plan')).default;
        const user = await User.findById(userId);
        if (user?.currentPlanId) {
            const currentPlan = await Plan.findById(user.currentPlanId);
            if (currentPlan) {
                const { canUpgrade } = await import('@/lib/utils/planTiers');
                const upgradeCheck = canUpgrade(currentPlan.planKey, normalizedPlanKey);
                if (!upgradeCheck.allowed) {
                    return NextResponse.json({ 
                        error: upgradeCheck.reason || `You cannot switch from your current plan to "${planTemplate.name}". ${upgradeCheck.reason || 'Please contact support if you need to change your plan.'}`,
                        code: 'DOWNGRADE_NOT_ALLOWED'
                    }, { status: 400 });
                }
            }
        }

        const features = planTemplate.features;

        // ✅ IMPROVED: Check what user currently has (only active resources)
        const [store, whatsappAccount, aiAgent] = await Promise.all([
            Store.findOne({ owner: userId, active: true }),
            WhatsAppAccount.findOne({ owner: userId, active: true }),
            AIAgent.findOne({ owner: userId, active: true }),
        ]);

        // ✅ FIXED: Check if store is properly configured (not just placeholder)
        const hasStore = !!store;
        const isStoreConfigured = hasStore && 
            store.brandName && 
            store.brandName !== 'My Store' &&
            store.description && 
            store.description !== 'Store setup in progress';
        
        // ✅ FIXED: Check if WhatsApp account is properly connected (not just placeholder)
        const hasWhatsApp = !!whatsappAccount;
        const isWhatsAppConnected = hasWhatsApp && 
            whatsappAccount.status === 'connected' && 
            whatsappAccount.verified &&
            whatsappAccount.waBusinessId && 
            !whatsappAccount.waBusinessId.startsWith('draft-') &&
            !whatsappAccount.waBusinessId.startsWith('temp-');
        
        const hasAIAgent = !!aiAgent;

        // Determine what the selected plan needs based on features
        const planNeeds = {
            needsStore: features.store?.enabled === true,
            needsWhatsApp: features.whatsapp?.enabled === true,
            needsAIAgent: features.ai?.agent === true,
        };

        // Track what we created (but don't create placeholders if user needs to configure)
        const created: string[] = [];

        // ✅ FIXED: Don't create placeholder stores/WhatsApp accounts during upgrade
        // Instead, redirect to appropriate setup pages if needed
        // Only reactivate existing inactive stores if they're already configured
        if (planNeeds.needsStore && !isStoreConfigured) {
            // Check for existing inactive stores that are already configured
            const existingStore = await Store.findOne({ owner: userId });
            
            if (existingStore && !existingStore.active && 
                existingStore.brandName && existingStore.brandName !== 'My Store' &&
                existingStore.description && existingStore.description !== 'Store setup in progress') {
                // Reactivate existing configured store
                existingStore.active = true;
                await existingStore.save();
                created.push('store');
                // Update isStoreConfigured after reactivation
                // (will be checked again in redirect logic)
            }
            // If no store or unconfigured store exists, redirect to info page (handled below)
        }

        // ✅ FIXED: Don't create placeholder WhatsApp accounts during upgrade
        // Only reactivate existing inactive accounts if they're already configured
        if (planNeeds.needsWhatsApp && !isWhatsAppConnected) {
            // Check for existing inactive WhatsApp account that's already configured
            const existingWaAccount = await WhatsAppAccount.findOne({ owner: userId });
            
            if (existingWaAccount && !existingWaAccount.active &&
                existingWaAccount.status === 'connected' &&
                existingWaAccount.verified &&
                existingWaAccount.waBusinessId &&
                !existingWaAccount.waBusinessId.startsWith('draft-') &&
                !existingWaAccount.waBusinessId.startsWith('temp-')) {
                // Reactivate existing configured account
                existingWaAccount.active = true;
                existingWaAccount.settings.aiAgent = planNeeds.needsAIAgent;
                // Generate webhook verify token if missing
                if (!existingWaAccount.webhookVerifyToken) {
                    existingWaAccount.webhookVerifyToken = generateWebhookVerifyToken();
                }
                await existingWaAccount.save();
                created.push('whatsapp');
                // Update isWhatsAppConnected after reactivation
                // (will be checked again in redirect logic)
            }
            // If no WhatsApp account or unconfigured account exists, redirect to WhatsApp setup (handled below)
        }

        // ✅ IMPROVED: Create AI Agent if needed and missing
        if (planNeeds.needsAIAgent && !hasAIAgent) {
            // Check for existing inactive AI agent
            const existingAgent = await AIAgent.findOne({ owner: userId });
            
            if (existingAgent && !existingAgent.active) {
                // Reactivate existing agent
                existingAgent.enabled = true;
                existingAgent.active = true;
                
                // Link to WhatsApp account if available
                let waAccount = whatsappAccount;
                if (!waAccount) {
                    waAccount = await WhatsAppAccount.findOne({ owner: userId });
                }
                if (waAccount) {
                    existingAgent.account = waAccount._id;
                    waAccount.settings.aiAgent = true;
                    await waAccount.save();
                }
                
                await existingAgent.save();
                created.push('aiAgent');
            } else if (!existingAgent) {
                // Find or create WhatsApp account for AI agent
                let waAccount = whatsappAccount;
                if (!waAccount) {
                    waAccount = await WhatsAppAccount.findOne({ owner: userId });
                }

                // ✅ Create placeholder WhatsApp account if none exists
                if (!waAccount) {
                    // Generate webhook verify token helper
                    function generateWebhookVerifyToken(): string {
                        return crypto.randomBytes(6).toString('hex');
                    }
                    
                    const tempToken = `temp-token-${Date.now()}-${Math.random().toString(36).substring(7)}`;
                    waAccount = await WhatsAppAccount.create({
                        owner: userId,
                        waBusinessId: `temp-${Date.now()}`,
                        waNumberId: `temp-${Date.now()}`,
                        waNumber: '+1234567890',
                        waTokenEncrypted: encryptToken(tempToken),
                        webhookVerifyToken: generateWebhookVerifyToken(),
                        verified: false,
                        status: "disconnected",
                        settings: {
                            autoReply: false,
                            orderConfirmation: false,
                            ad: false,
                            aiAgent: true,
                        },
                        aiConfig: { personality: "friendly assistant" },
                        preferredTemplates: { greeting: null, orderConfirmation: null, ad: null },
                        active: true,
                    });
                    console.log(`[Upgrade] Created placeholder WhatsApp account for AI agent`);
                }

                const newAgent = await AIAgent.create({
                    owner: userId,
                    account: waAccount._id, // ✅ Always assign WhatsApp account
                    enabled: true,
                    prompt: "You are a helpful sales assistant that helps customers with their questions and guides them through purchases.",
                    templates: [],
                    memory: "",
                    file: "",
                    active: true,
                });

                // Update WhatsApp account to enable AI agent
                waAccount.settings.aiAgent = true;
                await waAccount.save();
                console.log(`[Upgrade] Created AI agent with WhatsApp account ${waAccount._id}`);

                created.push('aiAgent');
            }
        }

        // ✅ FIXED: Re-check configuration status after reactivation
        // After reactivating stores/WhatsApp accounts, we need to verify they're still configured
        let finalStoreConfigured = isStoreConfigured;
        let finalWhatsAppConnected = isWhatsAppConnected;
        
        if (created.includes('store')) {
            // Re-check store after reactivation
            const reactivatedStore = await Store.findOne({ owner: userId, active: true });
            finalStoreConfigured = reactivatedStore && 
                reactivatedStore.brandName && 
                reactivatedStore.brandName !== 'My Store' &&
                reactivatedStore.description && 
                reactivatedStore.description !== 'Store setup in progress';
        }
        
        if (created.includes('whatsapp')) {
            // Re-check WhatsApp after reactivation
            const reactivatedWa = await WhatsAppAccount.findOne({ owner: userId, active: true });
            finalWhatsAppConnected = reactivatedWa && 
                reactivatedWa.status === 'connected' && 
                reactivatedWa.verified &&
                reactivatedWa.waBusinessId && 
                !reactivatedWa.waBusinessId.startsWith('draft-') &&
                !reactivatedWa.waBusinessId.startsWith('temp-');
        }

        // ✅ FIXED: Determine redirect path based on what user needs to configure
        let redirectTo = '';

        // Check if user needs to configure store first
        if (planNeeds.needsStore && !finalStoreConfigured) {
            // User needs store features but doesn't have a properly configured store
            redirectTo = `/${locale}/onboarding/info?plan=${planKey}`;
        } 
        // ✅ FIXED: Check if user needs to configure WhatsApp first
        else if (planNeeds.needsWhatsApp && !finalWhatsAppConnected) {
            // User needs WhatsApp features but doesn't have a connected WhatsApp account
            // Redirect to WhatsApp setup page (dashboard WhatsApp tab)
            redirectTo = `/${locale}/dashboard/whatsapp?setup=true&plan=${planKey}`;
        } 
        // ✅ FIXED: Check if plan is free or paid to determine redirect
        else if (planTemplate.defaultPrice === 0) {
            // Free plan - activate plan directly (no payment needed)
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + planTemplate.defaultDurationDays);

            // Check for existing plan
            let userPlan = user.currentPlanId 
                ? await Plan.findById(user.currentPlanId)
                : null;

            if (userPlan) {
                // Update existing plan
                userPlan.planKey = normalizedPlanKey;
                userPlan.price = 0;
                userPlan.durationDays = planTemplate.defaultDurationDays;
                userPlan.startDate = startDate;
                userPlan.endDate = endDate;
                userPlan.status = "active";
                await userPlan.save();
            } else {
                // Create new plan
                userPlan = new Plan({
                    userId: user._id,
                    planKey: normalizedPlanKey,
                    price: 0,
                    durationDays: planTemplate.defaultDurationDays,
                    startDate: startDate,
                    endDate: endDate,
                    status: "active",
                });
                await userPlan.save();
                user.currentPlanId = userPlan._id;
                await user.save();
            }

            // Redirect to dashboard
            redirectTo = `/${locale}/dashboard`;
        }
        else {
            // Paid plan - redirect to checkout for payment
            redirectTo = `/${locale}/onboarding/checkout?plan=${planKey}`;
        }

        return NextResponse.json({
            success: true,
            created,
            hasStore: hasStore || created.includes('store'),
            hasWhatsApp: hasWhatsApp || created.includes('whatsapp'),
            hasAIAgent: hasAIAgent || created.includes('aiAgent'),
            redirectTo,
        });
    } catch (error: any) {
        console.error('Upgrade error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process upgrade' },
            { status: 500 }
        );
    }
}

