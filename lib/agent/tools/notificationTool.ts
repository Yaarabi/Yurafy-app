import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * 🔔 Send notification to owner when agent needs assistance
 * Used when customer requests something the agent cannot handle
 */
export const sendOwnerNotificationTool = tool(
    async ({ ownerId, title, message, customerPhone, customerName, issueType }) => {
        try {
            // Get base URL for internal API calls
            const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
            
            // Call notifications API
            const response = await fetch(`${baseUrl}/api/notifications/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ownerId,
                    type: "agent",
                    title,
                    message,
                    link: "/dashboard/conversations",
                    metadata: {
                        action: "agent_assistance_needed",
                        customerPhone,
                        customerName,
                        issueType,
                        timestamp: new Date().toISOString(),
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("[sendOwnerNotificationTool] API error:", errorData);
                return `❌ Failed to send notification: ${errorData.error || "Unknown error"}`;
            }

            const result = await response.json();
            console.log(`[sendOwnerNotificationTool] Notification sent successfully for ${customerPhone}`);
            
            return `✅ Notification sent to owner successfully. The owner will review your request and respond soon.`;
        } catch (error: any) {
            console.error("[sendOwnerNotificationTool] Error:", error);
            return `❌ Failed to send notification: ${error.message || "Network error"}`;
        }
    },
    {
        name: "send_owner_notification",
        description: "Send a notification to the business owner when you encounter a situation you cannot handle, such as: customer requests beyond your capabilities, urgent issues requiring human intervention, complex problems, special requests, complaints, or when you need owner assistance. Use this to escalate issues to the owner.",
        schema: z.object({
            ownerId: z.string().describe("The ID of the business owner"),
            title: z.string().describe("Brief title for the notification (e.g., 'Customer Assistance Needed', 'Special Request')"),
            message: z.string().describe("Detailed message explaining what the customer needs and why you cannot handle it"),
            customerPhone: z.string().describe("Customer's phone number"),
            customerName: z.string().optional().describe("Customer's name if known"),
            issueType: z.enum([
                "out_of_scope",
                "technical_issue",
                "special_request",
                "complaint",
                "urgent_attention",
                "product_inquiry",
                "custom_order",
                "other"
            ]).describe("Type of issue requiring owner attention")
        }),
    }
);

export const notificationTools = [sendOwnerNotificationTool];
