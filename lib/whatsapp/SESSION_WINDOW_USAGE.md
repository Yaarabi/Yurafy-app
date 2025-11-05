# Session Window Checker - Usage Examples

This document provides examples of how to use the `isWithin24HourWindow` function in different scenarios.

## Function Signature

```typescript
async function isWithin24HourWindow(
    account: IWhatsAppAccount,
    customerPhone: string,
    currentTimestamp?: number  // Optional: timestamp in milliseconds
): Promise<boolean>
```

## Example 1: New Incoming Customer Message (Webhook → Automation)

When a new customer message arrives via webhook, pass the message timestamp to handle race conditions:

```typescript
// In webhook route (app/api/whatsapp/webhook/route.ts)
const message = webhookPayload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
const from = message.from;
const messageTimestamp = Number(message.timestamp) * 1000; // Convert to milliseconds

// Trigger automation with timestamp
await fetch(`${process.env.NEXTAUTH_URL}/api/whatsapp/automation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        accountId: account._id,
        from,
        messageText: message.text?.body,
        messageTimestamp, // ✅ Pass timestamp to handle race condition
    }),
});

// In automation route (app/api/whatsapp/automation/route.ts)
const { accountId, from, messageText, messageTimestamp } = await req.json();

const account = await WhatsAppAccount.findById(accountId);
const withinWindow = await isWithin24HourWindow(
    account, 
    from, 
    messageTimestamp  // ✅ Pass timestamp from webhook
);

if (withinWindow) {
    // Can send free-form text message
    await sendWhatsAppMessage(account, from, replyText, token);
} else {
    // Must use approved template message
    await sendTemplateMessage(account, from, template, token);
}
```

## Example 2: Sending Outbound Message (Manual Send)

When manually sending a message (not in response to a new incoming message), don't pass the timestamp:

```typescript
// In sendMessage.ts or whatsappFunction.ts
export async function sendWhatsAppMessage(
    account: IWhatsAppAccount,
    to: string,
    text: string,
    token: string
) {
    // Check session window without timestamp (checks DB for latest message)
    const withinWindow = await isWithin24HourWindow(account, to);
    
    if (!withinWindow) {
        throw new Error("24-hour session window expired. Use approved template message instead.");
    }
    
    // Send message via WhatsApp API
    await axios.post(`https://graph.facebook.com/v17.0/${account.waNumberId}/messages`, {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
}
```

## Example 3: Checking Before Sending Order Confirmation

When sending order confirmations, you might want to check the session window:

```typescript
// In order confirmation route
const customerPhone = order.shippingAddress.phone;

// Check if we can send free-form text (not template)
const withinWindow = await isWithin24HourWindow(account, customerPhone);

if (withinWindow) {
    // Optionally send a free-form confirmation message
    await sendWhatsAppMessage(account, customerPhone, confirmationText, token);
} else {
    // Must use approved template (works outside 24h window)
    await sendTemplateMessage(account, customerPhone, template, token);
}
```

## How It Works

### Priority Logic

1. **If `currentTimestamp` is provided and within 24 hours:**
   - Returns `true` immediately (handles race condition with DB writes)

2. **Finds latest inbound (customer) message:**
   - Searches conversation messages array for `direction: "incoming"`
   - Uses the most recent inbound message timestamp
   - If `currentTimestamp` was provided and is newer, uses that instead

3. **Fallback to outbound messages:**
   - If no inbound messages found, uses latest outbound message timestamp
   - Handles edge cases where only outgoing messages exist

4. **Final fallback:**
   - Uses `conversation.lastTimestamp` if available (legacy support)

5. **Returns `false` if:**
   - No conversation exists (first contact - requires template)
   - No messages found
   - Hours since last message >= 24

### Phone Number Normalization

The function automatically normalizes phone numbers to `+<country_code>...` format:

```typescript
// All of these are equivalent:
await isWithin24HourWindow(account, "+1234567890");
await isWithin24HourWindow(account, "1234567890");
await isWithin24HourWindow(account, "+1-234-567-890");
await isWithin24HourWindow(account, "(123) 456-7890");
```

## Important Notes

- **Timestamps must be in milliseconds** (JavaScript `Date.now()` format)
- **WhatsApp webhook timestamps are in seconds** - multiply by 1000 to convert
- **Race condition handling**: Always pass `messageTimestamp` when processing new incoming messages
- **First contact**: Returns `false` for new customers (only templates allowed)

