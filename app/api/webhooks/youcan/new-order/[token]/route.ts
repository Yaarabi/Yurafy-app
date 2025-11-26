import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import YouCanStore from "@/models/youcanStore";
import Order from "@/models/orders";
import crypto from 'crypto';

function mapYouCanToOrderDoc(youcanOrder: any, ownerId: string) {
    const customer = youcanOrder.customer || {};
    const shipping = youcanOrder.shipping || youcanOrder.shipping_address || {};

    const fullName = `${(customer.first_name || '')} ${(customer.last_name || '')}`.trim() || shipping.name || youcanOrder.name || 'Guest';
    const phone = customer.phone || shipping.phone || '';

    const products = Array.isArray(youcanOrder.items)
        ? youcanOrder.items.map((it: any) => ({
            product: undefined,
            name: it.name || it.title || 'Unnamed product',
            quantity: Number(it.quantity ?? it.qty ?? 1),
            price: Number(parseFloat(String(it.total ?? it.unit_price ?? it.price ?? 0)) || 0),
            color: it.color,
            size: it.size,
        }))
        : [];

    const shippingAddress = {
        fullName: fullName || 'Guest',
        phone: phone || '',
        email: customer.email || undefined,
        address: shipping.address1 || shipping.address || shipping.street || '',
        city: shipping.city || undefined,
        country: shipping.country || undefined,
    };

    const totalAmount = Number(parseFloat(String(youcanOrder.total ?? youcanOrder.total_price ?? 0)) || 0);

    return {
        owner: ownerId,
        products,
        shippingAddress,
        totalAmount,
        deliveryInstructions: youcanOrder.note || undefined,
        preferredTime: undefined,
        status: 'new' as const,
        source: {
            store: 'youcan',
            id: youcanOrder.id ?? null,
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

    const store = await YouCanStore.findOne({ token }).lean() as any;
    if (!store) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Read raw body for HMAC verification, then parse JSON
    let rawBody: string;
    try {
        rawBody = await req.text();
    } catch (err) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Verify signature header if a webhook secret is configured on the store.
    // YouCan's docs don't clearly state webhook signing; make verification optional.
    const signatureHeader = req.headers.get('x-youcan-signature') || req.headers.get('x-signature') || req.headers.get('signature') || '';
    const clientSecret = store?.clientSecret;

    if (clientSecret) {
        if (!signatureHeader) {
            console.error(`[YouCan Webhook] Missing signature header for token: ${token}`);
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        try {
            const provided = String(signatureHeader).replace(/^sha256=/i, '');
            const expected = crypto.createHmac('sha256', clientSecret).update(rawBody).digest('hex');

            if (expected.length !== provided.length) {
                console.error(`[YouCan Webhook] Invalid signature length for token: ${token}`);
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }

            const expectedBuf = Buffer.from(expected, 'hex');
            const providedBuf = Buffer.from(provided, 'hex');
            if (!crypto.timingSafeEqual(expectedBuf, providedBuf)) {
                console.error(`[YouCan Webhook] Invalid signature for token: ${token}`);
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        } catch (err: any) {
            console.error('[YouCan Webhook] Error verifying signature:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
    } else {
        if (signatureHeader) {
            console.warn('[YouCan Webhook] Signature header present but no webhook secret configured on store; ignoring signature.');
        }
        // No client secret configured: skip HMAC verification. Rely on unguessable token + idempotency.
    }

    // Parse JSON after signature verified
    let body: any;
    try {
        body = JSON.parse(rawBody);
    } catch (err) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Only process new orders
    const event = body.event || body.type || '';
    const status = (body.status || '').toString().toLowerCase();
    if (!(event === 'order.created' || status === 'pending' || status === 'new')) {
        // Not a new order; ignore
        return NextResponse.json({ success: true, skipped: true }, { status: 200 });
    }

    const ownerId = store.owner ? store.owner.toString?.() ?? String(store.owner) : undefined;
    if (!ownerId) return NextResponse.json({ error: 'Store owner not found' }, { status: 500 });

    const youcanOrder = body.order || body.data || body;

    // Ensure we have an external id to dedupe; if missing, skip
    const externalId = youcanOrder?.id ?? null;
    if (!externalId) return NextResponse.json({ error: 'Missing external order id' }, { status: 400 });

    // Idempotency: check existing order with same source.id
    const existing = await Order.findOne({ 'source.store': 'youcan', 'source.id': externalId }).lean();
    if (existing) {
        return NextResponse.json({ success: true, skipped: true, reason: 'duplicate' }, { status: 200 });
    }

    const doc = mapYouCanToOrderDoc(youcanOrder, ownerId);

    try {
        const created = await Order.create(doc as any);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err: any) {
        console.error('Error saving order from YouCan webhook:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
