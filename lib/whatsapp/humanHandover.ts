import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppConversation from "@/models/whatsappMessage";
import { AIError } from "../agent/errorHandler";

/**
 * Escalate a conversation to human support
 */
export async function escalateToHuman(
    ownerId: string,
    customerPhone: string,
    reason: string
): Promise<void> {
    await connectDB();
    
    // Normalize phone number
    let phone = customerPhone.replace(/\D/g, "");
    if (!phone.startsWith("+")) phone = "+" + phone;
    
    // Update conversation status
    await WhatsAppConversation.findOneAndUpdate(
        { owner: ownerId, "customer.phone": phone },
        {
            $set: {
                status: "human_required",
                "metadata.escalationReason": reason,
                "metadata.escalatedAt": new Date()
            }
        },
        { upsert: true }
    );
    
    console.log(`[Human Handover] Escalated ${phone} for owner ${ownerId}. Reason: ${reason}`);
    
    // TODO: Send notification to owner (email, webhook, push notification, etc.)
    // Example:
    // await sendOwnerNotification(ownerId, {
    //     type: "human_handover",
    //     customerPhone: phone,
    //     reason: reason
    // });
}

/**
 * Determine if a conversation should be escalated to human support
 */
export function shouldEscalateToHuman(
    error: AIError,
    retryCount: number,
    customerMessage: string
): boolean {
    // Escalate if non-retryable error
    if (!error.retryable) return true;
    
    // Escalate if max retries exceeded
    if (retryCount >= 3) return true;
    
    // Escalate if customer expresses frustration or requests human
    const frustrationKeywords = [
        'human', 'person', 'representative', 'agent',
        'speak to someone', 'talk to someone',
        'help me', 'not working', 'broken',
        'frustrated', 'angry', 'disappointed'
    ];
    
    const lowerMessage = customerMessage.toLowerCase();
    if (frustrationKeywords.some(k => lowerMessage.includes(k))) {
        return true;
    }
    
    return false;
}
