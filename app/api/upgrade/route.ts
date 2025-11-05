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

        const { planKey, locale = 'en' } = await req.json();

        if (!planKey) {
            return NextResponse.json({ error: "Plan key is required" }, { status: 400 });                                                                       
        }

        const userId = session.user.id;
        
        // Normalize plan key
        const normalizedPlanKey = normalizePlanKey(planKey);
        
        // Get plan template to determine features
        const planTemplate = await getPlanTemplate(normalizedPlanKey);
        if (!planTemplate) {
            return NextResponse.json({ error: `Invalid plan: ${planKey}` }, { status: 400 });
        }

        const features = planTemplate.features;

        // ✅ IMPROVED: Check what user currently has (only active resources)
        const [store, whatsappAccount, aiAgent] = await Promise.all([
            Store.findOne({ owner: userId, active: true }),
            WhatsAppAccount.findOne({ owner: userId, active: true }),
            AIAgent.findOne({ owner: userId, active: true }),
        ]);

        const hasStore = !!store;
        const hasWhatsApp = !!whatsappAccount;
        const hasAIAgent = !!aiAgent;

        // Determine what the selected plan needs based on features
        const planNeeds = {
            needsStore: features.store?.enabled === true,
            needsWhatsApp: features.whatsapp?.enabled === true,
            needsAIAgent: features.ai?.agent === true,
        };

        // Track what we created
        const created: string[] = [];

        // ✅ IMPROVED: Create store if needed and missing (check for domain conflicts)
        if (planNeeds.needsStore && !hasStore) {
            // Check for existing inactive stores first
            const existingStore = await Store.findOne({ owner: userId });
            
            if (existingStore && !existingStore.active) {
                // Reactivate existing store - ensure all required fields are present
                existingStore.active = true;
                
                // ✅ FIX: Ensure all required fields are present (provide defaults if missing)
                if (!existingStore.hero || !existingStore.hero.title || !existingStore.hero.subtitle || !existingStore.hero.imageUrl) {
                    existingStore.hero = {
                        title: existingStore.hero?.title || "Welcome to " + (existingStore.brandName || "My Store"),
                        subtitle: existingStore.hero?.subtitle || "Your one-stop shop for quality products",
                        imageUrl: existingStore.hero?.imageUrl || "/placeholder-hero.jpg",
                    };
                }
                
                if (!existingStore.about || !existingStore.about.title || !existingStore.about.description) {
                    existingStore.about = {
                        title: existingStore.about?.title || "About Us",
                        description: existingStore.about?.description || "We are dedicated to providing the best products and services to our customers.",
                    };
                }
                
                if (!existingStore.footer || !existingStore.footer.text) {
                    existingStore.footer = {
                        text: existingStore.footer?.text || `© ${new Date().getFullYear()} ${existingStore.brandName || "My Store"}. All rights reserved.`,
                    };
                }
                
                await existingStore.save();
                created.push('store');
            } else if (!existingStore) {
                // Generate unique domain
                let domain = `store-${userId.toString().slice(-6)}`;
                let domainExists = await Store.findOne({ domain });
                let counter = 1;
                
                // Ensure domain is unique
                while (domainExists) {
                    domain = `store-${userId.toString().slice(-6)}-${counter}`;
                    domainExists = await Store.findOne({ domain });
                    counter++;
                }
                
                // ✅ FIX: Include all required fields when creating a new store
                await Store.create({
                    owner: userId,
                    brandName: "My Store",
                    domain: domain,
                    description: "Store setup in progress",
                    themeId: 1,
                    theme: {
                        primaryColor: "#6366f1",
                        secondaryColor: "#8b5cf6",
                        textColor: "#1f2937",
                    },
                    themeStructure: {
                        header: true,
                        hero: true,
                        about: true,
                        trust: true,
                        productGrid: true,
                        footer: true,
                    },
                    hero: {
                        title: "Welcome to My Store",
                        subtitle: "Your one-stop shop for quality products",
                        imageUrl: "/placeholder-hero.jpg",
                    },
                    about: {
                        title: "About Us",
                        description: "We are dedicated to providing the best products and services to our customers.",
                    },
                    footer: {
                        text: `© ${new Date().getFullYear()} My Store. All rights reserved.`,
                    },
                    active: true,
                });
                created.push('store');
            }
        }

        // ✅ IMPROVED: Create WhatsApp account if needed and missing (avoid duplicates)
        if (planNeeds.needsWhatsApp && !hasWhatsApp) {
            // Check for existing inactive WhatsApp account
            const existingWaAccount = await WhatsAppAccount.findOne({ owner: userId });
            
            if (existingWaAccount && !existingWaAccount.active) {
                // Reactivate existing account
                existingWaAccount.active = true;
                existingWaAccount.settings.aiAgent = planNeeds.needsAIAgent;
                // Generate webhook verify token if missing
                if (!existingWaAccount.webhookVerifyToken) {
                    existingWaAccount.webhookVerifyToken = generateWebhookVerifyToken();
                }
                await existingWaAccount.save();
                created.push('whatsapp');
            } else if (!existingWaAccount) {
                // Create new placeholder account
                const placeholderToken = encryptToken(`draft-${userId}-${Date.now()}`);
                const draftBusinessId = `draft-${userId.toString().slice(-8)}`;
                const draftNumberId = `draft-${userId.toString().slice(-8)}`;
                const draftNumber = `+10000000000`;
                // Generate random webhook verify token for this account
                const webhookVerifyToken = generateWebhookVerifyToken();

                await WhatsAppAccount.create({
                    owner: userId,
                    waBusinessId: draftBusinessId,
                    waNumberId: draftNumberId,
                    waNumber: draftNumber,
                    waTokenEncrypted: placeholderToken,
                    webhookVerifyToken: webhookVerifyToken, // Use generated verify token
                    verified: false,
                    status: 'disconnected',
                    settings: {
                        autoReply: planNeeds.needsAIAgent,
                        orderConfirmation: false,
                        ad: false,
                        aiAgent: planNeeds.needsAIAgent,
                    },
                    aiConfig: {
                        personality: "friendly assistant",
                    },
                    preferredTemplates: {
                        greeting: null,
                        orderConfirmation: null,
                        ad: null,
                    },
                    active: true,
                });
                created.push('whatsapp');
            }
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

        // ✅ FIXED: Determine redirect path with locale included
        let redirectTo = '';

        if (planKey.toLowerCase() === 'free') {
            redirectTo = `/${locale}/onboarding/info?plan=${planKey}`;
        } else if (normalizedPlanKey === 'Starter') {
            redirectTo = hasStore || created.includes('store')
                ? `/${locale}/onboarding/checkout?plan=${planKey}`
                : `/${locale}/onboarding/info?plan=${planKey}`;
        } else if (features.whatsapp?.enabled && !features.store?.enabled) {
            // WhatsApp-only plans
            redirectTo = `/${locale}/onboarding/checkout?plan=${planKey}`;
        } else if (features.store?.enabled && features.whatsapp?.enabled) {
            // Mixed plans (Pro Seller, Visionary)
            redirectTo = hasStore || created.includes('store')
                ? `/${locale}/onboarding/checkout?plan=${planKey}`
                : `/${locale}/onboarding/info?plan=${planKey}`;
        } else {
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

