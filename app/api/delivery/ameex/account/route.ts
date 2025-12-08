import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import AmeexAccount from '@/models/integration/ameexAccount';
import { encryptToken, decryptToken } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const acc = await AmeexAccount.findOne({ owner: session.user.id });
  if (!acc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  // Do not return apiKey
  const obj = acc.toObject ? acc.toObject() : JSON.parse(JSON.stringify(acc));
  if ('apiKey' in obj) delete obj.apiKey;
  return NextResponse.json({ account: obj });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const payload = await req.json();
    const { apiId, apiKey, businessId, orderStatus, autoSend, enabled } = payload || {};
    if (!apiId || !apiKey) return NextResponse.json({ error: 'apiId and apiKey are required' }, { status: 400 });

    const apiKeyEncrypted = encryptToken(String(apiKey));
    const apiIdEncrypted = encryptToken(String(apiId));

    let acc = await AmeexAccount.findOne({ owner: session.user.id });
    if (acc) {
      acc.apiIdEncrypted = apiIdEncrypted;
      acc.apiKeyEncrypted = apiKeyEncrypted;
      if (businessId) acc.businessId = businessId;
      if (orderStatus) acc.orderStatus = orderStatus;
      if (typeof autoSend === 'boolean') acc.autoSend = autoSend;
      if (typeof enabled === 'boolean') acc.enabled = enabled;
      await acc.save();
    } else {
      acc = await AmeexAccount.create({ owner: session.user.id, apiIdEncrypted, apiKeyEncrypted, businessId, orderStatus, autoSend: !!autoSend, enabled: enabled !== false });
    }
    const obj = acc.toObject ? acc.toObject() : JSON.parse(JSON.stringify(acc));
    if ('apiKeyEncrypted' in obj) delete obj.apiKeyEncrypted;
    if ('apiIdEncrypted' in obj) delete obj.apiIdEncrypted;
    return NextResponse.json({ success: true, account: obj });
  } catch (err: any) {
    console.error('Error saving Ameex account:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const updates = await req.json();
    if (!updates || typeof updates !== 'object') return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    const acc = await AmeexAccount.findOne({ owner: session.user.id });
    if (!acc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (typeof updates.apiId === 'string' && updates.apiId.trim()) acc.apiIdEncrypted = encryptToken(updates.apiId.trim());
    if (typeof updates.apiKey === 'string' && updates.apiKey.trim()) acc.apiKeyEncrypted = encryptToken(updates.apiKey.trim());
    if (typeof updates.businessId === 'string') acc.businessId = updates.businessId;
    if (typeof updates.orderStatus === 'string') acc.orderStatus = updates.orderStatus;
    if (typeof updates.autoSend === 'boolean') acc.autoSend = updates.autoSend;
    if (typeof updates.enabled === 'boolean') acc.enabled = updates.enabled;

    await acc.save();
    const obj = acc.toObject ? acc.toObject() : JSON.parse(JSON.stringify(acc));
    delete obj.apiKey;
    return NextResponse.json({ success: true, account: obj });
  } catch (err: any) {
    console.error('Error updating Ameex account:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const deleted = await AmeexAccount.findOneAndDelete({ owner: session.user.id });
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting Ameex account:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
