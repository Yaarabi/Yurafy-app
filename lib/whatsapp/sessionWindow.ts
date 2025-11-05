import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppConversation, { IWhatsAppMessage } from "@/models/whatsappMessage";
import { IWhatsAppAccount } from "@/models/whatsappAccount";

/**
 * Check if a customer is within the 24-hour session window for free-form messages.
 * 
 * WhatsApp Business API Policy:
 * - Free-form text messages can only be sent within 24 hours after the customer's last message
 * - Outside the window, only approved template messages are allowed
 * 
 * This function handles race conditions by accepting the current message timestamp,
 * which ensures the session window is immediately reopened when a new customer message arrives,
 * even if the database write hasn't completed yet.
 * 
 * @param account - WhatsApp account object containing owner information
 * @param customerPhone - Customer phone number (will be normalized to +<country_code>... format)
 * @param currentTimestamp - Optional timestamp (in milliseconds) of the NEW incoming message.
 *                          When provided, this bypasses database queries to handle race conditions.
 *                          Should be the timestamp from the webhook payload when a new message arrives.
 * @returns true if free-form messages can be sent (within 24-hour window), false otherwise
 * 
 * @example
 * // When a new customer message arrives (from webhook)
 * const messageTimestamp = Number(webhookPayload.timestamp) * 1000; // Convert to milliseconds
 * const canSend = await isWithin24HourWindow(account, customerPhone, messageTimestamp);
 * 
 * @example
 * // When checking for outbound messages (no new message context)
 * const canSend = await isWithin24HourWindow(account, customerPhone);
 */
export async function isWithin24HourWindow(
    account: IWhatsAppAccount,
    customerPhone: string,
    currentTimestamp?: number
): Promise<boolean> {
    await connectDB();
    
    // Normalize phone number to +<country_code>... format
    let phone = customerPhone.replace(/\D/g, "");
    if (!phone.startsWith("+")) phone = "+" + phone;
    
    // Find conversation in database
    const conversation = await WhatsAppConversation.findOne({
        owner: account.owner,
        "customer.phone": phone
    }).lean();
    
    // If currentTimestamp is provided and within 24h, and conversation exists,
    // immediately return true (handles race condition with DB writes)
    // This handles the case where a new message just arrived but DB write hasn't completed
    if (currentTimestamp !== undefined && currentTimestamp > 0 && conversation) {
        const now = Date.now();
        const hoursSinceNewMessage = (now - currentTimestamp) / (1000 * 60 * 60);
        
        // If new message arrived within last 24 hours and conversation exists, session is open
        if (hoursSinceNewMessage < 24) {
            return true;
        }
    }
    
    if (!conversation) {
        // No previous conversation - cannot send text message
        // Only approved templates are allowed for first contact
        // Note: Even if currentTimestamp is provided, if no conversation exists, this is first contact
        return false;
    }
    
    // Find the latest inbound (customer) message timestamp
    // This is what actually opens/reopens the 24-hour session window
    let latestInboundTimestamp: number | null = null;
    
    if (conversation.messages && conversation.messages.length > 0) {
        // Filter for inbound messages (from customer) and find the latest one
        const inboundMessages = conversation.messages.filter(
            (msg: IWhatsAppMessage) => msg.direction === "incoming"
        );
        
        if (inboundMessages.length > 0) {
            // Sort by timestamp descending and get the most recent inbound message
            latestInboundTimestamp = Math.max(
                ...inboundMessages.map((msg: IWhatsAppMessage) => msg.timestamp)
            );
        }
    }
    
    // If currentTimestamp was provided and is newer than latest inbound, use it
    if (currentTimestamp !== undefined && currentTimestamp > 0) {
        if (!latestInboundTimestamp || currentTimestamp > latestInboundTimestamp) {
            latestInboundTimestamp = currentTimestamp;
        }
    }
    
    // Fallback: If no inbound messages found, use latest outbound message timestamp
    // This handles edge cases where we only have outgoing messages
    if (!latestInboundTimestamp) {
        if (conversation.messages && conversation.messages.length > 0) {
            const outboundMessages = conversation.messages.filter(
                (msg: IWhatsAppMessage) => msg.direction === "outgoing"
            );
            
            if (outboundMessages.length > 0) {
                latestInboundTimestamp = Math.max(
                    ...outboundMessages.map((msg: IWhatsAppMessage) => msg.timestamp)
                );
            }
        }
        
        // Final fallback: use lastTimestamp if available (legacy support)
        if (!latestInboundTimestamp && conversation.lastTimestamp) {
            latestInboundTimestamp = conversation.lastTimestamp;
        }
    }
    
    // If still no timestamp found, this is effectively a first contact
    if (!latestInboundTimestamp) {
        return false;
    }
    
    // Calculate hours since the last relevant message
    const now = Date.now();
    const hoursSinceLastMessage = (now - latestInboundTimestamp) / (1000 * 60 * 60);
    
    // Window is valid if less than 24 hours
    return hoursSinceLastMessage < 24;
}
