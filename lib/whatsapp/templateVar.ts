import { IOrder } from "@/models/orders";

export const VARIABLES = [
    { label: "Name", value: "{{1}}" },
    { label: "Email", value: "{{2}}" },
    { label: "Phone", value: "{{3}}" },
    { label: "Address", value: "{{4}}" },
    { label: "City", value: "{{5}}" },
    { label: "Country", value: "{{6}}" },
    { label: "Total Amount", value: "{{7}}" },
    { label: "Product Name", value: "{{8}}" },
    { label: "Product Quantity", value: "{{9}}" },
    { label: "Product Price", value: "{{10}}" },
];

/** 
 * Replace template variables with values from the order.
 * @param templateContent - The content string from the template
 * @param order - The order object
 */
export function fillTemplate(templateContent: any, order: IOrder): string {
    if (!templateContent) return "";
    let content = String(templateContent); // force string

    for (const variable of VARIABLES) {
        const key = variable.value.replace(/{{|}}/g, "");
        let value: any = "";

        switch (key) {
            case "fullName":
                value = order.shippingAddress.fullName;
                break;
            case "email":
                value = order.shippingAddress.email || "";
                break;
            case "phone":
                value = order.shippingAddress.phone;
                break;
            case "address":
                value = order.shippingAddress.address;
                break;
            case "city":
                value = order.shippingAddress.city || "";
                break;
            case "country":
                value = order.shippingAddress.country || "";
                break;
            case "totalAmount":
                value = order.totalAmount;
                break;
            case "product.name":
                value = order.products[0]?.name || "";
                break;
            case "product.quantity":
                value = order.products[0]?.quantity || "";
                break;
            case "product.price":
                value = order.products[0]?.price || "";
                break;
            default:
                value = "";
        }

        content = content.replace(new RegExp(variable.value, "g"), String(value));
    }

    return content;
}

