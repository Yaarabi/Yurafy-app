import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import ShopifyStore from "@/models/integration/shopifyStore";

// Map incoming Shopify order to internal orders/guest payload
function mapShopifyToOrderPayload(shopifyOrder: any, ownerId: string) {
    const customer = shopifyOrder.customer || {};
    const shipping = shopifyOrder.shipping_address || {};
    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || shipping.name || shopifyOrder.name || 'Guest';
    const phone = customer.phone || shipping.phone || '';

    const products = Array.isArray(shopifyOrder.line_items)
        ? shopifyOrder.line_items.map((li: any) => ({
            product: undefined,
            name: li.title || li.name || '',
            quantity: Number(li.quantity) || 1,
            price: Number(li.price ?? li.price_amount ?? 0) || 0,
            color: li.properties?.color || undefined,
            size: li.properties?.size || undefined,
        }))
        : [];

    const shippingAddress = {
        fullName,
        phone: phone || '',
        email: customer.email || undefined,
        address: shipping.address1 || shipping.address || '',
        city: shipping.city || undefined,
        country: shipping.country || undefined,
    };

    const totalAmount = Number(shopifyOrder.total_price ?? shopifyOrder.subtotal_price ?? 0) || 0;

    return {
        owner: ownerId,
        products,
        shippingAddress,
        totalAmount,
        deliveryInstructions: shopifyOrder.note || undefined,
        preferredTime: undefined,
        source: {
            store: 'shopify',
            id: shopifyOrder.id != null ? String(shopifyOrder.id) : null,
        },
    };
}

type MaybeAsyncParams = { params: { token: string } } | { params: Promise<{ token: string }> };

function isPromiseParams(v: unknown): v is Promise<{ token: string }> {
    return !!v && typeof (v as any).then === 'function';
}

export async function POST(req: NextRequest, context: MaybeAsyncParams) {
    await connectDB();

    const params = context?.params;
    let token: string | undefined;
    if (isPromiseParams(params)) {
        try {
            const resolved = await params;
            token = resolved?.token;
        } catch (e) {
            // ignore resolution errors and handle below
        }
    } else {
        token = params?.token;
    }
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
