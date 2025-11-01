import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Tool to show/hide UI components
 * This allows the agent to control what the user sees
 */
export const showComponentTool = tool(
    async ({ componentId, data }: { componentId: string; data?: any }) => {
        // This is a marker tool - the actual UI control is handled by the frontend
        // The agent uses this to indicate it wants to show a component
        return `Component "${componentId}" should be displayed with data: ${JSON.stringify(data || {})}`;
    },
    {
        name: "show_component",
        description: `Show a UI component to display information to the user. Use this when you want to show:
- "store_preview" - Show a preview of the store information collected so far
- "store_preview_edit" - Show the final store preview with edit options (USE THIS when you have collected ALL required store information and want to show a preview where the user can edit before saving)
- "confirmation_ui" - Show a confirmation dialog before creating the store
- "store_summary" - Show a summary of all collected store information

IMPORTANT: Use "store_preview_edit" ONLY when you have collected all required information (brandName, domain, description, hero, about, footer) and want to show the user a final preview with edit capabilities before saving.`,
        schema: z.object({
            componentId: z.enum(["store_preview", "store_preview_edit", "confirmation_ui", "store_summary"]).describe("The ID of the component to show"),
            data: z.any().optional().describe("Data to display in the component (store information, summary, etc.)"),
        }),
    }
);

export const hideComponentTool = tool(
    async ({ componentId }: { componentId: string }) => {
        // Marker tool for hiding components
        return `Component "${componentId}" should be hidden`;
    },
    {
        name: "hide_component",
        description: `Hide a UI component. Use this when you want to remove a component from view.`,
        schema: z.object({
            componentId: z.enum(["store_preview", "store_preview_edit", "confirmation_ui", "store_summary"]).describe("The ID of the component to hide"),
        }),
    }
);

