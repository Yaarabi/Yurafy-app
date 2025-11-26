import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import YouCanStore from '@/models/youcanStore';
import { registerWebhook } from '@/lib/youcan/resthooks';

export async function GET(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const cookieState = req.cookies.get('youcan_oauth_state')?.value;
    if (!code || !state || !cookieState || state !== cookieState) {
        return NextResponse.json({ error: 'Invalid OAuth state or missing code' }, { status: 400 });
    }

    const clientId = process.env.YOUCAN_CLIENT_ID;
    const clientSecret = process.env.YOUCAN_CLIENT_SECRET;
    const redirectUri = process.env.YOUCAN_REDIRECT_URL;
    if (!clientId || !clientSecret || !redirectUri) return NextResponse.json({ error: 'YouCan app not configured' }, { status: 500 });

    // Exchange code for token
    const tokenRes = await fetch('https://api.youcan.shop/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
        }),
    });

    if (!tokenRes.ok) {
        const txt = await tokenRes.text();
        console.error('[YouCan OAuth] token exchange failed:', tokenRes.status, txt);
        return NextResponse.json({ error: 'Token exchange failed', details: txt }, { status: 502 });
    }

    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token || tokenJson.accessToken;
    const refreshToken = tokenJson.refresh_token || tokenJson.refreshToken;
    const expiresIn = tokenJson.expires_in || tokenJson.expiresIn;

    if (!accessToken) return NextResponse.json({ error: 'No access token returned' }, { status: 502 });

    // Save store and register webhook
    const ownerId = session.user.id;
    let store = await YouCanStore.findOne({ owner: ownerId });
    if (store) {
        store.accessToken = accessToken;
        store.refreshToken = refreshToken;
        if (expiresIn) store.expiresAt = new Date(Date.now() + Number(expiresIn) * 1000);
        if (!store.token) store.token = Math.random().toString(36).slice(2, 10);
        await store.save();
    } else {
        const token = Math.random().toString(36).slice(2, 10);
        store = await YouCanStore.create({ owner: ownerId, token, accessToken, refreshToken, expiresAt: expiresIn ? new Date(Date.now() + Number(expiresIn) * 1000) : undefined });
    }

    // Attempt to register webhook
    try {
        const res = await registerWebhook(store.accessToken as string, store.token);
        const subId = res?.id || (res && res.id) || null;
        if (subId) {
            store.subscriptionId = subId;
            store.connect = true;
            await store.save();
        }
    } catch (err: any) {
        console.error('[YouCan] failed to register webhook on OAuth callback:', err);
        store.connect = false;
        await store.save();
        return NextResponse.json({ error: 'Failed to register webhook with YouCan', details: String(err?.message || err) }, { status: 502 });
    }

    // Clear the state cookie and redirect to settings page
    const res = NextResponse.redirect(new URL('/dashboard/settings/stores', req.url));
    res.headers.set('Set-Cookie', 'youcan_oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
    return res;
}
