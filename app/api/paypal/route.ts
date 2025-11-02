import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import Plan from "@/models/plan";
import WhatsAppAccount from "@/models/whatsappAccount";
import AIAgent from "@/models/ai-agent";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { verified: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { orderId, plan, planKey } = await req.json();
        if (!orderId || !plan) {
            return NextResponse.json(
                { verified: false, error: "Missing order or plan" },
                { status: 400 }
            );
        }

        const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
        const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
        const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // switch to live later

        // Get PayPal access token
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
        const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        });

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        if (!accessToken) {
            return NextResponse.json(
                { verified: false, error: "Failed to get PayPal access token" },
                { status: 500 }
            );
        }

        // Verify order
        const verifyRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        const orderData = await verifyRes.json();
        if (orderData.status !== "COMPLETED") {
            return NextResponse.json(
                { verified: false, error: "Order not completed" },
                { status: 400 }
            );
        }

        // Find user
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { verified: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Find or create user's plan
        let userPlan: any;
        const durationDays = 30;
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + durationDays);
        const price = parseFloat(orderData.purchase_units?.[0]?.amount?.value || "0");

        // Normalize planKey - use planKey from request if available, otherwise use plan
        // Map common variations to proper planKey enum values
        const planKeyMap: Record<string, string> = {
            'starter': 'Starter',
            'whatsapp': 'WhatsApp Automation',
            'whatsapp automation': 'WhatsApp Automation',
            'aiagent': 'AI WhatsApp Agent',
            'ai whatsapp agent': 'AI WhatsApp Agent',
            'ai agent': 'AI WhatsApp Agent',
            'proseller': 'Pro Seller',
            'pro seller': 'Pro Seller',
            'visionary': 'Visionary',
            'free': 'free',
        };

        const planKeyToUse = planKey || plan;
        const normalizedPlanKey = planKeyMap[planKeyToUse.toLowerCase()] || planKeyToUse;

        if (user.currentPlanId) {
            // Update existing plan (for upgrades)
            userPlan = await Plan.findById(user.currentPlanId);
            if (userPlan) {
                userPlan.planKey = normalizedPlanKey as any;
                userPlan.price = price;
                userPlan.durationDays = durationDays;
                userPlan.startDate = startDate;
                userPlan.endDate = endDate;
                userPlan.status = "active";
                await userPlan.save();
            }
        }

        // If no existing plan or plan not found, create a new one
        if (!userPlan || !user.currentPlanId) {
            userPlan = new Plan({
                userId: user._id,
                planKey: normalizedPlanKey as any,
                price: price,
                durationDays: durationDays,
                startDate: startDate,
                endDate: endDate,
                status: "active",
            });
            await userPlan.save();
            
            // Update user's current plan reference
            user.currentPlanId = userPlan._id;
        }

        // Update user flags
        user.active = true;
        // Only set onboardingCompleted to true if it was false (for first-time onboarding)
        // Don't override it if user is upgrading
        if (!user.onboardingCompleted) {
            user.onboardingCompleted = true;
        }
        await user.save();

        // Check if plan includes WhatsApp functionality
        const plansWithWhatsApp = ['whatsapp', 'aiAgent', 'proSeller', 'visionary'];
        const hasWhatsApp = planKey && plansWithWhatsApp.includes(planKey);

        // Check if plan includes AI Agent
        const plansWithAIAgent = ['aiAgent', 'visionary'];
        const hasAIAgent = planKey && plansWithAIAgent.includes(planKey);

        // Create WhatsApp account if plan includes WhatsApp
        if (hasWhatsApp) {
            try {
                // Helper function to encrypt token
                const encryptToken = (token: string) => {
                    const iv = crypto.randomBytes(16);
                    const cipher = crypto.createCipheriv(
                        "aes-256-ctr",
                        Buffer.from(process.env.ENCRYPTION_KEY!, "hex"),
                        iv
                    );
                    const encrypted = Buffer.concat([cipher.update(token), cipher.final()]);
                    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
                };

                // Check if WhatsApp account already exists
                let waAccount = await WhatsAppAccount.findOne({ owner: user._id });

                if (!waAccount) {
                    // Create new WhatsApp account with temporary credentials
                    // User will need to update these with real WhatsApp Cloud API credentials
                    const tempToken = `temp-token-${Date.now()}-${Math.random().toString(36).substring(7)}`;
                    const waTokenEncrypted = encryptToken(tempToken);

                    waAccount = await WhatsAppAccount.create({
                        owner: user._id,
                        waBusinessId: `temp-${Date.now()}`,
                        waNumberId: `temp-${Date.now()}`,
                        waNumber: '+1234567890', // Placeholder - user needs to update
                        waTokenEncrypted,
                        verified: false,
                        status: "disconnected",
                        settings: {
                            autoReply: hasAIAgent,
                            orderConfirmation: false,
                            ad: false,
                            aiAgent: hasAIAgent,
                        },
                        aiConfig: {
                            personality: "friendly assistant",
                        },
                        preferredTemplates: {
                            greeting: null,
                            orderConfirmation: null,
                            ad: null,
                        },
                        active: true, // Set active when WhatsApp account is created
                    });
                } else {
                    // Update existing account settings
                    waAccount.settings.autoReply = hasAIAgent;
                    waAccount.settings.aiAgent = hasAIAgent;
                    waAccount.active = true; // Ensure active is true
                    await waAccount.save();
                }

                // Create AI Agent if plan includes AI Agent
                if (hasAIAgent) {
                    const existingAgent = await AIAgent.findOne({ owner: user._id });
                    
                    if (!existingAgent) {
                        await AIAgent.create({
                            owner: user._id,
                            account: waAccount._id,
                            enabled: true,
                            prompt: "You are a helpful sales assistant for the store. Help customers with product inquiries, orders, and provide excellent customer service.",
                            templates: [],
                            memory: "",
                            file: "",
                            active: true, // Set active when AI agent is created
                        });
                    } else {
                        // Update existing agent
                        existingAgent.account = waAccount._id;
                        existingAgent.enabled = true;
                        existingAgent.active = true; // Ensure active is true
                        await existingAgent.save();
                    }
                }
            } catch (waError) {
                console.error("Error creating WhatsApp account/AI agent:", waError);
                // Don't fail the payment verification if WhatsApp account creation fails
                // The payment is still valid, just log the error
            }
        }

        return NextResponse.json({ verified: true });
    } catch (err) {
        console.error("PayPal verify error:", err);
        return NextResponse.json(
            { verified: false, error: "Server error" },
            { status: 500 }
        );
    }
}
