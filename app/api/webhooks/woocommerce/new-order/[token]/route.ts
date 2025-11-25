import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import WooStore from "@/models/wooStore";

function mapWooToOrderPayload(wooOrder: any, ownerId: string) {
    const customer = wooOrder.customer || wooOrder.billing || {};
    const shipping = wooOrder.shipping || wooOrder.shipping_address || {};

    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || shipping.name || wooOrder.number || '';
    const phone = customer.phone || shipping.phone || '';

    const products = Array.isArray(wooOrder.line_items)
        ? wooOrder.line_items.map((li: any) => ({
              product: undefined,
              name: li.name || li.title,
              quantity: li.quantity,
              price: li.price || li.total || '0',
              sku: li.sku,
              variantId: li.variation_id || li.variant_id || undefined,
          }))
        : [];

    const shippingAddress = {
        fullName: fullName || 'Guest',
        phone: phone || '',
        email: customer.email || undefined,
        address: shipping.address_1 || shipping.address1 || shipping.address || '',
        city: shipping.city || undefined,
        country: shipping.country || undefined,
    };

    const totalAmount = parseFloat(wooOrder.total || wooOrder.total_price || '0');

    return {
        owner: ownerId,
        products,
        shippingAddress,
        totalAmount,
        deliveryInstructions: wooOrder.customer_note || wooOrder.note || undefined,
        preferredTime: undefined,
        metadata: {
            source: 'woocommerce_webhook',
            wooOrderId: wooOrder.id || wooOrder.order_number || undefined,
            financial_status: wooOrder.status || undefined,
        },
    };
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
    await connectDB();

    const token = params?.token;
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const store = await WooStore.findOne({ token }).lean() as any;
    if (!store) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    let body: any;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const ownerId = store.owner ? store.owner.toString?.() ?? String(store.owner) : undefined;
    if (!ownerId) return NextResponse.json({ error: 'Store owner not found' }, { status: 500 });

    const payload = mapWooToOrderPayload(body, ownerId);

    try {
        const ordersUrl = `${process.env.NEXTAUTH_URL || ''}/api/orders/guest`;
        const res = await fetch(ordersUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return NextResponse.json({ error: 'Failed to create order', details: data }, { status: res.status });
        return NextResponse.json({ success: true, created: data }, { status: 201 });
    } catch (err: any) {
        console.error('Error calling orders API (woo):', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
