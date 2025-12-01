
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
