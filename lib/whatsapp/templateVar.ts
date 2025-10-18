import { IOrder } from "@/models/orders";

const VARIABLES = [
    { label: "Name", value: "{{fullName}}" },
    { label: "Email", value: "{{email}}" },
    { label: "Phone", value: "{{phone}}" },
    { label: "Address", value: "{{address}}" },
    { label: "City", value: "{{city}}" },
    { label: "Country", value: "{{country}}" },
    { label: "Total Amount", value: "{{totalAmount}}" },
    { label: "Product Name", value: "{{product.name}}" },
    { label: "Product Quantity", value: "{{product.quantity}}" },
    { label: "Product Price", value: "{{product.price}}" },
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

