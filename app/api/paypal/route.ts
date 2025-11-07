import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import mongoose from "mongoose";
import User from "@/models/users";
import Plan from "@/models/plan";
import WhatsAppAccount from "@/models/whatsappAccount";
import AIAgent from "@/models/ai-agent";
import Store from "@/models/store";
import crypto from "crypto";
import { getPlanTemplate, normalizePlanKey, validatePlanFeatures } from "@/lib/utils/planUtils";

// Encrypt WhatsApp token helper
function encryptToken(token: string): string {
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

export async function POST(req: Request) {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.email) {
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

    await connectDB();
    const mongoSession = await mongoose.startSession();

    try {
        await mongoSession.withTransaction(async () => {
            // ✅ IDEMPOTENCY CHECK: Check if this order was already processed
            const existingPlan = await Plan.findOne({ paymentOrderId: orderId })
                .session(mongoSession)
                .lean();
            
            if (existingPlan) {
                // Already processed - return success without re-processing
                return NextResponse.json({ 
                    verified: true, 
                    message: "Payment already processed",
                    planId: existingPlan._id.toString()
                });
            }

            // Get PayPal access token and verify order
            const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
            const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
            const PAYPAL_API = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

            const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
            const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
                method: "POST",
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "grant_type=client_credentials",
            });

            if (!tokenRes.ok) {
                throw new Error("Failed to get PayPal access token");
            }

            const tokenData = await tokenRes.json();
            const accessToken = tokenData.access_token;
            if (!accessToken) {
                throw new Error("Failed to get PayPal access token");
            }

            // Verify order with PayPal
            const verifyRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!verifyRes.ok) {
                throw new Error("Failed to verify PayPal order");
            }

            const orderData = await verifyRes.json();
            if (orderData.status !== "COMPLETED") {
                throw new Error("Order not completed");
            }

            // Find user
            const user = await User.findOne({ email: authSession.user.email })
                .session(mongoSession);
            
            if (!user) {
                throw new Error("User not found");
            }

            // Normalize plan key
            const planKeyToUse = normalizePlanKey(planKey || plan);
            
            // ✅ PAYMENT VALIDATION: Get plan template and validate price (including special plans)
            const planTemplate = await getPlanTemplate(planKeyToUse);
            if (!planTemplate) {
                throw new Error(
                    `Invalid plan: "${planKeyToUse}". This plan may no longer be available. Please select a different plan.`
                );
            }

            const paidAmount = parseFloat(orderData.purchase_units?.[0]?.amount?.value || "0");
            const expectedPrice = planTemplate.defaultPrice;
            
            // Allow small floating point differences (PayPal may round differently)
            const priceDifference = Math.abs(paidAmount - expectedPrice);
            if (priceDifference > 0.01 && expectedPrice > 0) {
                throw new Error(
                    `Payment verification failed: Expected $${expectedPrice.toFixed(2)} for ${planTemplate.name} plan, but received $${paidAmount.toFixed(2)}. Please contact support if you believe this is an error.`
                );
            }

            // ✅ TRANSACTION SAFETY: All operations in transaction
            const durationDays = planTemplate.defaultDurationDays;
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + durationDays);
            const transactionId = `txn-${orderId}-${Date.now()}`;

            // Check for existing plan
            let userPlan = user.currentPlanId 
                ? await Plan.findById(user.currentPlanId).session(mongoSession)
                : null;

            if (userPlan) {
                // Update existing plan
                userPlan.planKey = planKeyToUse;
                userPlan.price = paidAmount;
                userPlan.durationDays = durationDays;
                userPlan.startDate = startDate;
                userPlan.endDate = endDate;
                userPlan.status = "active";
                userPlan.paymentOrderId = orderId;
                userPlan.paymentProcessedAt = new Date();
                userPlan.transactionId = transactionId;
                await userPlan.save({ session: mongoSession });
            } else {
                // Create new plan
                userPlan = new Plan({
                    userId: user._id,
                    planKey: planKeyToUse,
                    price: paidAmount,
                    durationDays: durationDays,
                    startDate: startDate,
                    endDate: endDate,
                    status: "active",
                    paymentOrderId: orderId,
                    paymentProcessedAt: new Date(),
                    transactionId: transactionId,
                });
                await userPlan.save({ session: mongoSession });
                user.currentPlanId = userPlan._id;
            }

            // Update user flags
            user.active = true;
            if (!user.onboardingCompleted) {
                user.onboardingCompleted = true;
            }
            await user.save({ session: mongoSession });

            // Send thank you notification for plan subscription
            try {
                const { createSubscriptionNotification } = await import('@/lib/utils/notifications');
                const planName = planTemplate.name || planKeyToUse;
                await createSubscriptionNotification(user._id.toString(), planKeyToUse, planName);
            } catch (error) {
                console.error('Error creating subscription notification:', error);
                // Don't fail subscription if notification fails
            }

            // ✅ RESOURCE MANAGEMENT: Update resources based on plan features
            const features = planTemplate.features;

            // Handle store activation/deactivation
            if (features.store?.enabled) {
                const userStores = await Store.find({ owner: user._id }).session(mongoSession);
                for (const store of userStores) {
                    store.active = true;
                    await store.save({ session: mongoSession });
                }
            } else {
                const userStores = await Store.find({ owner: user._id }).session(mongoSession);
                for (const store of userStores) {
                    store.active = false;
                    await store.save({ session: mongoSession });
                }
            }

            // Handle WhatsApp account creation/update
            if (features.whatsapp?.enabled) {
                let waAccount = await WhatsAppAccount.findOne({ owner: user._id })
                    .session(mongoSession);

                if (!waAccount) {
                    // Create placeholder account (user will configure later)
                    const tempToken = `temp-token-${Date.now()}-${Math.random().toString(36).substring(7)}`;
                    const waTokenEncrypted = encryptToken(tempToken);
                    // Generate random webhook verify token for this account
                    const webhookVerifyToken = generateWebhookVerifyToken();

                    waAccount = new WhatsAppAccount({
                        owner: user._id,
                        waBusinessId: `temp-${Date.now()}`,
                        waNumberId: `temp-${Date.now()}`,
                        waNumber: '+1234567890',
                        waTokenEncrypted,
                        webhookVerifyToken: webhookVerifyToken, // Use generated verify token
                        verified: false,
                        status: "disconnected",
                        settings: {
                            autoReply: features.ai?.agent || false,
                            orderConfirmation: false,
                            ad: false,
                            aiAgent: features.ai?.agent || false,
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
                    await waAccount.save({ session: mongoSession });
                } else {
                    // Update existing account
                    waAccount.settings.autoReply = features.ai?.agent || false;
                    waAccount.settings.aiAgent = features.ai?.agent || false;
                    waAccount.active = true;
                    // Generate webhook verify token if missing
                    if (!waAccount.webhookVerifyToken) {
                        waAccount.webhookVerifyToken = generateWebhookVerifyToken();
                    }
                    await waAccount.save({ session: mongoSession });
                }

                // Create/update AI Agent if needed
                if (features.ai?.agent) {
                    let aiAgent = await AIAgent.findOne({ owner: user._id })
                        .session(mongoSession);

                    if (!aiAgent) {
                        // ✅ Ensure WhatsApp account exists before creating AI agent
                        if (!waAccount) {
                            // Create placeholder WhatsApp account if it doesn't exist
                            const tempToken = `temp-token-${Date.now()}-${Math.random().toString(36).substring(7)}`;
                            const waTokenEncrypted = encryptToken(tempToken);
                            const webhookVerifyToken = generateWebhookVerifyToken();
                            
                            waAccount = new WhatsAppAccount({
                                owner: user._id,
                                waBusinessId: `temp-${Date.now()}`,
                                waNumberId: `temp-${Date.now()}`,
                                waNumber: '+1234567890',
                                waTokenEncrypted,
                                webhookVerifyToken,
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
                            await waAccount.save({ session: mongoSession });
                            console.log(`[PayPal/Onboarding] Created placeholder WhatsApp account for AI agent`);
                        }
                        
                        aiAgent = new AIAgent({
                            owner: user._id,
                            account: waAccount._id, // ✅ Always assign WhatsApp account
                            enabled: true,
                            prompt: "You are a helpful sales assistant for the store. Help customers with product inquiries, orders, and provide excellent customer service.",
                            templates: [],
                            memory: "",
                            file: "",
                            active: true,
                        });
                        await aiAgent.save({ session: mongoSession });
                        console.log(`[PayPal/Onboarding] Created AI agent with WhatsApp account ${waAccount._id}`);
                    } else {
                        // ✅ Ensure account is assigned (update if missing)
                        if (!aiAgent.account && waAccount) {
                            aiAgent.account = waAccount._id;
                            console.log(`[PayPal/Onboarding] Auto-assigned WhatsApp account ${waAccount._id} to existing AI agent`);
                        } else if (!aiAgent.account) {
                            // Find existing WhatsApp account if not provided
                            const existingWaAccount = await WhatsAppAccount.findOne({ owner: user._id })
                                .session(mongoSession);
                            if (existingWaAccount) {
                                aiAgent.account = existingWaAccount._id;
                                console.log(`[PayPal/Onboarding] Auto-assigned existing WhatsApp account ${existingWaAccount._id} to AI agent`);
                            }
                        }
                        aiAgent.enabled = true;
                        aiAgent.active = true;
                        await aiAgent.save({ session: mongoSession });
                    }
                } else {
                    // Deactivate AI agent if not in plan
                    const aiAgent = await AIAgent.findOne({ owner: user._id })
                        .session(mongoSession);
                    if (aiAgent) {
                        aiAgent.active = false;
                        aiAgent.enabled = false;
                        await aiAgent.save({ session: mongoSession });
                    }
                }
            } else {
                // Deactivate WhatsApp and AI if not in plan
                const waAccount = await WhatsAppAccount.findOne({ owner: user._id })
                    .session(mongoSession);
                if (waAccount) {
                    waAccount.active = false;
                    await waAccount.save({ session: mongoSession });
                }

                const aiAgent = await AIAgent.findOne({ owner: user._id })
                    .session(mongoSession);
                if (aiAgent) {
                    aiAgent.active = false;
                    aiAgent.enabled = false;
                    await aiAgent.save({ session: mongoSession });
                }
            }
        });

        return NextResponse.json({ verified: true });
    } catch (err: any) {
        console.error("PayPal verify error:", err);
        
        // ✅ ERROR RECOVERY: Return detailed error for retry
        return NextResponse.json(
            { 
                verified: false, 
                error: err.message || "Server error",
                retryable: !err.message?.includes("already processed") && !err.message?.includes("amount mismatch")
            },
            { status: 500 }
        );
    } finally {
        await mongoSession.endSession();
    }
}
