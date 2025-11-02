import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import Store from "@/models/store";
import WhatsAppAccount from "@/models/whatsappAccount";
import AIAgent from "@/models/ai-agent";
import crypto from "crypto";

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
// POST: Handle upgrade logic
// ------------------------
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { planKey } = await req.json();
        
        if (!planKey) {
            return NextResponse.json({ error: "Plan key is required" }, { status: 400 });
        }

        const userId = session.user.id;
        
        // Check what user currently has
        const [store, whatsappAccount, aiAgent] = await Promise.all([
            Store.findOne({ owner: userId }),
            WhatsAppAccount.findOne({ owner: userId }),
            AIAgent.findOne({ owner: userId }),
        ]);

        const hasStore = !!store;
        const hasWhatsApp = !!whatsappAccount;
        const hasAIAgent = !!aiAgent;

        // Determine what the selected plan needs
        const planNeeds = {
            needsStore: ['starter', 'proSeller', 'visionary'].includes(planKey),
            needsWhatsApp: ['whatsapp', 'aiAgent', 'proSeller', 'visionary'].includes(planKey),
            needsAIAgent: ['aiAgent', 'visionary'].includes(planKey),
        };

        // Track what we created
        const created: string[] = [];

        // Create store if needed and missing
        if (planNeeds.needsStore && !hasStore) {
            // For upgrades, create a minimal store (user will configure it in info page or after payment)
            const domain = `store-${userId.toString().slice(-6)}`;
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
                active: true,
            });
            created.push('store');
        }

        // Create WhatsApp account if needed and missing
        // Note: For upgrades, we create a placeholder account that user will configure
        // WhatsApp credentials will be set up after payment or in settings
        if (planNeeds.needsWhatsApp && !hasWhatsApp) {
            // Create draft WhatsApp account with minimal valid values
            // User will configure actual credentials after payment or in settings
            const placeholderToken = encryptToken(`draft-${userId}-${Date.now()}`);
            const draftBusinessId = `draft-${userId.toString().slice(-8)}`;
            const draftNumberId = `draft-${userId.toString().slice(-8)}`;
            const draftNumber = `+10000000000`; // Placeholder number
            
            await WhatsAppAccount.create({
                owner: userId,
                waBusinessId: draftBusinessId,
                waNumberId: draftNumberId,
                waNumber: draftNumber,
                waTokenEncrypted: placeholderToken,
                verified: false,
                status: 'disconnected',
                settings: {
                    autoReply: false,
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

        // Create AI Agent if needed and missing
        if (planNeeds.needsAIAgent && !hasAIAgent) {
            // Find or create WhatsApp account for AI agent
            let waAccount = whatsappAccount;
            if (!waAccount) {
                waAccount = await WhatsAppAccount.findOne({ owner: userId });
            }
            
            await AIAgent.create({
                owner: userId,
                account: waAccount?._id || null,
                enabled: true,
                prompt: "You are a helpful sales assistant that helps customers with their questions and guides them through purchases.",
                templates: [],
                memory: "",
                file: "",
                active: true,
            });
            
            // Update WhatsApp account to enable AI agent
            if (waAccount) {
                waAccount.settings.aiAgent = true;
                await waAccount.save();
            }
            
            created.push('aiAgent');
        }

        // Determine redirect path based on plan and what was created
        let redirectTo = '';
        
        if (planKey === 'free') {
            redirectTo = `/onboarding/info?plan=${planKey}`;
        } else if (planKey === 'starter') {
            // If store was just created or user already has store, go to checkout
            redirectTo = hasStore || created.includes('store') 
                ? `/onboarding/checkout?plan=${planKey}` 
                : `/onboarding/info?plan=${planKey}`;
        } else if (['whatsapp', 'aiAgent'].includes(planKey)) {
            // WhatsApp plans: if account was created, go to checkout
            redirectTo = `/onboarding/checkout?plan=${planKey}`;
        } else if (['proSeller', 'visionary'].includes(planKey)) {
            // Mixed plans: if store exists, go to checkout, otherwise info
            redirectTo = hasStore || created.includes('store')
                ? `/onboarding/checkout?plan=${planKey}`
                : `/onboarding/info?plan=${planKey}`;
        } else {
            redirectTo = `/onboarding/checkout?plan=${planKey}`;
        }

        return NextResponse.json({
            success: true,
            created,
            hasStore: hasStore || created.includes('store'),
            hasWhatsApp: hasWhatsApp || created.includes('whatsapp'),
            hasAIAgent: hasAIAgent || created.includes('aiAgent'),
            redirectTo,
        });
    } catch (error) {
        console.error('Upgrade error:', error);
        return NextResponse.json(
            { error: 'Failed to process upgrade' },
            { status: 500 }
        );
    }
}

