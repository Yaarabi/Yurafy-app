import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import WooStore from "@/models/wooStore";
import crypto from 'crypto';

function mapWooToOrderPayload(wooOrder: any, ownerId: string) {
    // WooCommerce v3 payloads: billing, shipping, line_items, customer_note
    const billing = wooOrder.billing || wooOrder.customer || {};
    const shipping = wooOrder.shipping || wooOrder.shipping_address || {};

    const firstName = (billing.first_name || billing.firstname || '').toString();
    const lastName = (billing.last_name || billing.lastname || '').toString();
    const fullName = `${firstName} ${lastName}`.trim() || `${shipping.first_name || ''} ${shipping.last_name || ''}`.trim() || wooOrder.number || 'Guest';
    const phone = (billing.phone || shipping.phone || billing.phone_number || '').toString();

    const products = Array.isArray(wooOrder.line_items)
        ? wooOrder.line_items.map((li: any) => ({
                product: undefined,
                name: li.name || li.title || li.product_name || '',
                quantity: Number(li.quantity ?? li.qty ?? 1) || 1,
                price: parseFloat(String(li.price ?? li.total ?? li.subtotal ?? 0)) || 0,
                color: li.meta?.color || li.properties?.color || undefined,
                size: li.meta?.size || li.properties?.size || undefined,
            }))
        : [];

    const shippingAddress = {
        fullName,
        phone: phone || '',
        email: billing.email || undefined,
        address: shipping.address_1 || shipping.address1 || shipping.address || billing.address_1 || '',
        city: shipping.city || billing.city || undefined,
        country: shipping.country || billing.country || undefined,
    };

    const totalAmount = parseFloat(String(wooOrder.total ?? wooOrder.total_price ?? wooOrder.total_paid ?? 0)) || 0;

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

    // Read raw body for signature verification first
    let rawBody: string;
    try {
        rawBody = await req.text();
    } catch (err) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Verify WooCommerce HMAC signature if header present
    const sigHeader = req.headers.get('x-wc-webhook-signature') || req.headers.get('X-WC-Webhook-Signature') || req.headers.get('X-WC-Webhook-Signature'.toLowerCase());
    const secret = store?.token; // token is used as secret key in the setup UI

    if (sigHeader) {
        if (!secret) {
            console.error('[WooCommerce Webhook] Signature header present but no secret configured for token:', token);
            return NextResponse.json({ error: 'Signature present but no secret configured' }, { status: 401 });
        }

        try {
            // WooCommerce uses HMAC-SHA256 and base64-encodes the result
            const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
            const provided = (sigHeader || '').trim();

            const expectedBuf = Buffer.from(expected, 'utf8');
            const providedBuf = Buffer.from(provided, 'utf8');

            // Use timingSafeEqual when buffers are same length
            if (expectedBuf.length !== providedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
                console.error('[WooCommerce Webhook] Invalid signature for token:', token, 'provided:', provided, 'expected:', expected);
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        } catch (err: any) {
            console.error('[WooCommerce Webhook] Error verifying signature:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
    }

    // Parse JSON after signature verification
    let body: any;
    try { body = rawBody ? JSON.parse(rawBody) : {}; } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

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
