// app/api/whatsapp/send-ads/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Template from "@/models/automation/templates";
import WhatsAppAccount, { IWhatsAppAccount } from "@/models/automation/whatsappAccount";   
import WhatsAppConversation from "@/models/automation/whatsappMessage";
import { sendTemplateMessage } from "@/lib/whatsapp/sendTemplate";
import { buildButtonUrlParameters } from "@/lib/whatsapp/templateUtils";
import { decryptToken } from "../webhook/route";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { normalizePhoneNumber } from "@/lib/whatsapp/phoneNormalize";

export async function POST(req: Request) {
    try {
        // Accept either a single `phone` or an array `phones` in the request body.
        const body = await req.json();
        const rawPhones: string[] = [];
        if (body.phone) rawPhones.push(body.phone);
        if (Array.isArray(body.phones)) rawPhones.push(...body.phones);
        if (!rawPhones.length) {
            return NextResponse.json({ error: "No phone numbers provided" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });                                                                               
        }

        const ownerId = session.user.id;
        await connectDB();

        // Ensure WhatsApp feature is allowed for this user
        const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
        const featureCheck = await ensureFeatureEnabled(ownerId, 'whatsapp');
        if (featureCheck) return featureCheck;

        // Fetch WhatsApp account
        const waAccount: IWhatsAppAccount | null = await WhatsAppAccount.findOne({ owner: ownerId });                                                           
        if (!waAccount) {
            return NextResponse.json({ error: "WhatsApp account not found" }, { status: 404 });
        }

        if (waAccount.status !== "connected") {
            return NextResponse.json({ error: "WhatsApp account not connected" }, { status: 400 });                                                             
        }

        if (!waAccount.settings?.ad) {
            return NextResponse.json({ error: "Ad sending is disabled" }, { status: 400 });                                                                     
        }

        const adTemplateName = waAccount.preferredTemplates?.ad;
        if (!adTemplateName) {
            return NextResponse.json({ error: "No ad template selected in account" }, { status: 400 });                                                         
        }

        const template = await Template.findOne({
            owner: ownerId,
            name: adTemplateName
        });

        if (!template) {
            return NextResponse.json({ error: "Ad template not found" }, { status: 404 });                                                      
        }

        // Check template status - only send if approved
        if (template.status !== "APPROVED") {
            return NextResponse.json({ 
                error: `Template "${adTemplateName}" is not approved. Status: ${template.status}` 
            }, { status: 400 });
        }

        const token = decryptToken(waAccount.waTokenEncrypted);

        // Send ad message for each provided phone number
        const results: any[] = [];
        for (const rawPhone of rawPhones) {
            if (!rawPhone) {
                results.push({ phone: null, status: "skipped", reason: "No phone number" });
                continue;
            }

            // Normalize phone number to E.164 format
            const phone = normalizePhoneNumber(rawPhone);

            try {
                // Check opt-in status before sending promotional messages
                const conversation = await WhatsAppConversation.findOne({
                    owner: ownerId,
                    "customer.phone": phone,
                });

                if (!conversation || conversation.optInStatus !== "opted_in") {
                    console.log(`[send-ad-template] Skipping ${phone}: User has not opted in (status: ${conversation?.optInStatus || "unknown"})`);
                    results.push({ phone, status: "skipped", reason: `User not opted in (status: ${conversation?.optInStatus || "unknown"})` });
                    continue;
                }

                // Extract variable values: we only have phone-level data, so fill phone where requested
                const variableValues: string[] = [];
                if (template.variables && template.variables.length > 0) {
                    for (const varName of template.variables) {
                        const key = varName.toLowerCase();
                        let value = "";
                        if (key === "phone") value = phone || "";
                        // other variables cannot be derived without order data
                        variableValues.push(value);
                    }
                }

                // Send as template message
                const buttonParamSets = buildButtonUrlParameters(template, undefined, phone);
                await sendTemplateMessage(waAccount, phone, template, variableValues, token, buttonParamSets);

                // Track ad template sent
                await WhatsAppConversation.findOneAndUpdate(
                    { owner: ownerId, "customer.phone": phone },
                    {
                        $set: {
                            "metadata.adTemplateSent": true,
                            "metadata.adTemplateSentAt": new Date(),
                        },
                    },
                    { upsert: true }
                );

                results.push({ phone, status: "sent" });

                // Delay between messages
                await new Promise((r) => setTimeout(r, 700 + Math.random() * 600));
            } catch (err: any) {
                console.error(`[send-ad-template] Error sending to ${phone}:`, err);
                results.push({ phone, status: "failed", error: err.message });
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (err: any) {
        console.error("Send ad template error:", err);
        return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 }); 
    }
}
