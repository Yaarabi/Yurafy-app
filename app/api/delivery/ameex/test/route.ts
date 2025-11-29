import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import AmeexAccount from '@/models/ameexAccount';
import { ameexAddParcel } from '@/lib/ameex';
import { decryptToken } from '@/lib/crypto';

export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const account = await AmeexAccount.findOne({ owner: session.user.id });
        if (!account || !account.enabled) return NextResponse.json({ error: 'Ameex account not configured' }, { status: 400 });

        const decryptedApiKey = decryptToken(account.apiKeyEncrypted || '');
        const decryptedApiId = decryptToken(account.apiIdEncrypted || '');

        const testOrderNum = `test-${Date.now()}`;

        const res = await ameexAddParcel({
            apiId: decryptedApiId,
            apiKey: decryptedApiKey,
            business: decryptedApiId,
            sender_id: decryptedApiId,
            receiver: 'John Doe',
            phone: '0606060606',
            // Use a city name (will be mapped to id by ameexAddParcel)
            city: 'Agadir',
            address: '123 Test St',
            cod: '555',
            order_num: testOrderNum,
            comment: 'Test parcel from Yurafy',
            products: [],
        });

        if (res.status >= 200 && res.status < 300) {
            return NextResponse.json({ success: true, status: res.status, body: res.body, order_num: testOrderNum });
        }

        return NextResponse.json({ error: 'Failed to send to Ameex', details: res.body, status: res.status }, { status: 502 });
    } catch (err: any) {
        console.error('Error sending test parcel to Ameex:', err);
        return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
    }
}
