import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import WooStore from "@/models/wooStore";

function mapWooToOrderPayload(wooOrder: any, ownerId: string) {
    const customer = wooOrder.customer || wooOrder.billing || {};
    const shipping = wooOrder.shipping || wooOrder.shipping_address || {};
    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || shipping.name || wooOrder.number || 'Guest';
    const phone = customer.phone || shipping.phone || '';

    const products = Array.isArray(wooOrder.line_items)
        ? wooOrder.line_items.map((li: any) => ({
              product: undefined,
              name: li.name || li.title || '',
              quantity: Number(li.quantity) || 1,
              price: Number(li.price ?? li.total ?? 0) || 0,
              color: li.meta?.color || li.properties?.color || undefined,
              size: li.meta?.size || li.properties?.size || undefined,
          }))
        : [];

    const shippingAddress = {
        fullName,
        phone: phone || '',
        email: customer.email || undefined,
        address: shipping.address_1 || shipping.address1 || shipping.address || '',
        city: shipping.city || undefined,
        country: shipping.country || undefined,
    };

    const totalAmount = Number(wooOrder.total ?? wooOrder.total_price ?? 0) || 0;

    return {
        owner: ownerId,
        products,
        shippingAddress,
        totalAmount,
        deliveryInstructions: wooOrder.customer_note || wooOrder.note || undefined,
        preferredTime: undefined,
        source: {
            store: 'woocommerce',
            id: wooOrder.id != null ? String(wooOrder.id) : null,
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
