import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import ShopifyStore from "@/models/shopifyStore";

// Map incoming Shopify order to internal orders/guest payload
function mapShopifyToOrderPayload(shopifyOrder: any, ownerId: string) {
    const customer = shopifyOrder.customer || {};
    const shipping = shopifyOrder.shipping_address || {};

    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || shipping.name || shopifyOrder.name || '';
    const phone = customer.phone || shipping.phone || '';

    const products = Array.isArray(shopifyOrder.line_items)
            ? shopifyOrder.line_items.map((li: any) => ({
                product: undefined,
                name: li.title,
                quantity: li.quantity,
                price: li.price || '0',
                sku: li.sku,
                variantId: li.variant_id || li.variantId || undefined,
            }))
        : [];

    const shippingAddress = {
        fullName: fullName || 'Guest',
        phone: phone || '',
        email: customer.email || undefined,
        address: shipping.address1 || shipping.address || '',
        city: shipping.city || undefined,
        country: shipping.country || undefined,
    };

    const totalAmount = parseFloat(shopifyOrder.total_price || shopifyOrder.subtotal_price || '0');

    return {
        owner: ownerId,
        products,
        shippingAddress,
        totalAmount,
        deliveryInstructions: shopifyOrder.note || undefined,
        preferredTime: undefined,
        metadata: {
            source: 'shopify_webhook',
            shopifyOrderId: shopifyOrder.id,
            shopifyName: shopifyOrder.name,
            financial_status: shopifyOrder.financial_status,
            fulfillment_status: shopifyOrder.fulfillment_status,
        },
    };
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
    await connectDB();

    const token = params?.token;
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    // Find shopify store by token to get owner id
    // Cast to `any` because Mongoose `lean()` typing can produce unions (doc | array) in some setups
    const store = await ShopifyStore.findOne({ token }).lean() as any;
    if (!store) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    let shopifyBody: any;
    try {
        shopifyBody = await req.json();
    } catch (err) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Map Shopify order to our internal order payload
    const ownerId = store.owner ? store.owner.toString?.() ?? String(store.owner) : undefined;
    if (!ownerId) return NextResponse.json({ error: 'Store owner not found' }, { status: 500 });

    const payload = mapShopifyToOrderPayload(shopifyBody, ownerId);

    // Call internal orders/guest API to create the order
    try {
        const ordersUrl = `${process.env.NEXTAUTH_URL || ''}/api/orders/guest`;
        const res = await fetch(ordersUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            console.error('Orders API returned error:', res.status, data);
            return NextResponse.json({ error: 'Failed to create order', details: data }, { status: res.status });
        }

        return NextResponse.json({ success: true, created: data }, { status: 201 });
    } catch (err: any) {
        console.error('Error calling orders API:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
