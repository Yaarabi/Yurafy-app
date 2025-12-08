import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import AmeexAccount from '@/models/integration/ameexAccount';
import Order from '@/models/store/orders';
import { ameexAddParcel } from '@/lib/ameex';
import { decryptToken } from '@/lib/crypto';

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'orderId is required' }, { status: 400 });

    const account = await AmeexAccount.findOne({ owner: session.user.id });
    if (!account || !account.enabled) return NextResponse.json({ error: 'Ameex account not configured' }, { status: 400 });

    const order = await Order.findById(orderId).lean() as any;
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Build payload from order
    const payload: any = {
        apiId: account.apiId,
        apiKey: account.apiKey,
        business: account.businessId || '2',
        receiver: order.shippingAddress?.fullName || '',
        phone: order.shippingAddress?.phone || '',
        city: order.shippingAddress?.city || '',
        address: order.shippingAddress?.address || order.shippingAddress?.address || '',
        cod: String(order.totalAmount || 0),
        order_num: String(order._id),
        comment: order.deliveryInstructions || '',
        product: order.products?.[0]?.name || '',
        products: (order.products || []).map((p: any) => ({ id: p.product || '', qty: p.quantity })),
    };

    // Call Ameex helper
    const decryptedApiKey = decryptToken(account.apiKeyEncrypted || '');
    const decryptedApiId = decryptToken(account.apiIdEncrypted || '');

    const res = await ameexAddParcel({
      apiId: decryptedApiId,
      apiKey: decryptedApiKey,
      business: account.businessId || '2',
      // Use the API id as the sender identifier by default
      sender_id: decryptedApiId,
      receiver: payload.receiver,
      phone: payload.phone,
      // Send city as provided by order (name or id). ameexAddParcel will map names to ids.
      city: payload.city || account.businessId || '1',
      address: payload.address,
      cod: payload.cod,
      order_num: payload.order_num,
      comment: payload.comment,
      product: payload.product,
      products: payload.products.filter((p: any) => p.id),
    });

    if (res.status >= 200 && res.status < 300) {
      // Optionally update order.deliveryCompany
      await Order.findByIdAndUpdate(orderId, { deliveryCompany: 'ameex' });
      return NextResponse.json({ success: true, status: res.status });
    }

    return NextResponse.json({ error: 'Failed to send to Ameex', details: res.body, status: res.status }, { status: 502 });
  } catch (err: any) {
    console.error('Error sending order to Ameex:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
