
import { IOrder } from "@/models/orders";
import { ITemplate } from "@/models/templates";

/**
 * Ensures variables array aligns with placeholders in content/caption and returns values in order.
 * Validates presence and fills sensible fallbacks to avoid Meta errors.
 */
export function fillTemplateVariables(template: ITemplate, order: IOrder): string[] {
    const variableValues: string[] = [];

    const getFirstProduct = () => order.products?.[0];
    const shipping = order.shippingAddress || ({} as any);

    const mapVar = (varName: string): string => {
        const key = varName.toLowerCase();
        switch (key) {
            // Customer
            case "fullname":
                return shipping.fullName || "";
            case "email":
                return shipping.email || "";
            case "phone":
                return shipping.phone || "";
            case "address":
                return shipping.address || "";
            case "city":
                return shipping.city || "";
            case "country":
                return shipping.country || "";

            // Order
            case "totalamount":
                return String(order.totalAmount ?? "");
            case "status":
                return String(order.status ?? "");
            case "deliveryinstructions":
                return String(order.deliveryInstructions ?? "");
            case "preferredtime":
                return String(order.preferredTime ?? "");
            case "deliverycompany":
                return String(order.deliveryCompany ?? "");

            // Product (first)
            case "productname":
            case "product.name":
                return getFirstProduct()?.name || "";
            case "productquantity":
            case "product.quantity":
                return String(getFirstProduct()?.quantity ?? "");
            case "productprice":
            case "product.price":
                return String(getFirstProduct()?.price ?? "");
            case "productcolor":
                return String(getFirstProduct()?.color ?? "");
            case "productsize":
                return String(getFirstProduct()?.size ?? "");

            // Aggregates
            case "productslist": {
                const list = (order.products || []).map(p => `${p.quantity}x ${p.name} - ${p.price}`).join("\n");
                return list || "";
            }
            case "totalitems":
                return String((order.products || []).reduce((acc, p) => acc + (p.quantity || 0), 0));

            default:
                return "";
        }
    };

    // Ensure variables align with placeholders count found in content/caption
    const content = `${template.content || ""} ${template.caption || ""}`;
    const seqMatches = Array.from(content.matchAll(/{{(\d+)}}/g)).map(m => Number(m[1]));
    const expectedCount = seqMatches.length;

    const vars = Array.isArray(template.variables) ? template.variables : [];
    const normalizedVars = vars.map(v => v.replace(/\s+/g, ""));

    // Fill values in given order
    for (const v of normalizedVars) {
        variableValues.push(mapVar(v));
    }

    // If placeholders exceed provided variables, pad with empty strings to avoid Meta errors
    while (variableValues.length < expectedCount) {
        variableValues.push("");
    }

    // Trim excess variables if any
    if (variableValues.length > expectedCount) {
        variableValues.length = expectedCount;
    }

    return variableValues;
}

/**
 * Validates that content/caption include placeholders for each variable sequentially: {{1}}, {{2}}, ...
 * Returns true if consistent, false otherwise.
 */
export function validateTemplatePlaceholders(template: ITemplate): boolean {
    const content = `${template.content || ""} ${template.caption || ""}`;
    const seqMatches = Array.from(content.matchAll(/{{(\d+)}}/g)).map(m => Number(m[1])).sort((a,b)=>a-b);
    if (seqMatches.length === 0) return true;
    for (let i = 0; i < seqMatches.length; i++) {
        if (seqMatches[i] !== i + 1) return false;
    }
    return true;
}

/**
 * Build URL button parameter sets for sending template messages.
 * Returns an array where each entry corresponds to one URL button's parameters.
 * Each set is ordered according to the count of placeholders found in the button's URL (e.g., {{1}}, {{2}} ...).
 * Priority for filling values:
 *  - First placeholder: external order id (order.source.id) or order._id or phone
 *  - Second placeholder: phone (E.164)
 *  - Remaining: empty strings
 */
export function buildButtonUrlParameters(
    template: ITemplate,
    order?: IOrder,
    phone?: string
): string[][] {
    const result: string[][] = [];
    const buttons = Array.isArray(template.buttons) ? template.buttons : [];
    for (const b of buttons) {
        if (b.type !== "URL" || !b.url) continue;
        const count = (b.url.match(/{{\d+}}/g) || []).length;
        if (count === 0) continue;
        const params: string[] = [];
        for (let i = 0; i < count; i++) {
            if (i === 0) {
                params.push(order?.source?.id || (order as any)?._id || phone || "");
            } else if (i === 1) {
                params.push(phone || "");
            } else {
                params.push("");
            }
        }
        result.push(params);
    }
    return result;
}
