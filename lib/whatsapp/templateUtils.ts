import { IOrder } from "@/models/orders";
import { ITemplate } from "@/models/templates";

export function fillTemplateVariables(template: ITemplate, order: IOrder): string[] {
    const variableValues: string[] = [];
    
    if (template.variables && template.variables.length > 0) {
        for (const varName of template.variables) {
            let value = "";
            switch (varName.toLowerCase()) {
                case "fullname":
                    value = order.shippingAddress.fullName || "";
                    break;
                case "email":
                    value = order.shippingAddress.email || "";
                    break;
                case "phone":
                    value = order.shippingAddress.phone || "";
                    break;
                case "address":
                    value = order.shippingAddress.address || "";
                    break;
                case "city":
                    value = order.shippingAddress.city || "";
                    break;
                case "country":
                    value = order.shippingAddress.country || "";
                    break;
                case "totalamount":
                    value = String(order.totalAmount || "");
                    break;
                case "product.name":
                    value = order.products[0]?.name || "";
                    break;
                case "product.quantity":
                    value = String(order.products[0]?.quantity || "");
                    break;
                case "product.price":
                    value = String(order.products[0]?.price || "");
                    break;
                default:
                    value = "";
            }
            variableValues.push(value);
        }
    }
    
    return variableValues;
}
