import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoDB';
import AmeexAccount from '@/models/integration/ameexAccount';
import Order from '@/models/store/orders';

export async function POST(req: NextRequest, context: any) {
    await connectDB();

    try {
        // Support both plain params and Promise-wrapped params depending on Next.js typing
        const rawParams = context?.params;
        const params = rawParams && typeof rawParams.then === 'function' ? await rawParams : rawParams;
        const token = params?.token;
        if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

        const acc = await AmeexAccount.findOne({ token });
        if (!acc) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

        const raw = await req.text();
        let body: any;
        try { body = raw ? JSON.parse(raw) : {}; } catch { body = raw || {}; }

        // Extract possible tracking/order identifiers
        const tracking = body.tracking || body.tracking_number || body.trackingNumber || body.ParcelCode || body.parcelCode || body.order_num || body.OrderNum || body.orderNumber || body.order || (body.parcel && (body.parcel.code || body.parcel.tracking || body.parcel.order_num)) || null;
        const status = body.status || body.Status || body.state || null;

        if (tracking) {
        // Find order owned by the same owner as the Ameex account
        const order = await Order.findOne({ owner: acc.owner, $or: [{ _id: tracking }, { 'source.id': String(tracking) }] });
        if (order && status) {
            const mapped = String(status).toLowerCase();
            if (mapped.includes('delivered')) order.status = 'delivered';
            else if (mapped.includes('shipped') || mapped.includes('in_transit') || mapped.includes('on_way')) order.status = 'shipped';
            else if (mapped.includes('cancel')) order.status = 'cancelled';
            else if (mapped.includes('confirm')) order.status = 'confirmed';

            order.deliveryCompany = 'ameex';
            await order.save();
        }
        }

        return NextResponse.json({}, { status: 200 });
    } catch (err: any) {
        console.error('Error handling Ameex webhook:', err);
        return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
    }
}
