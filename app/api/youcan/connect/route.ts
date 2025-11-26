import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
    const sessionCookie = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token');
    // We still redirect to OAuth even if session cookie missing; the callback will require session.

    const clientId = process.env.YOUCAN_CLIENT_ID;
    const redirectUri = process.env.YOUCAN_REDIRECT_URL;
    if (!clientId || !redirectUri) return NextResponse.json({ error: 'YouCan app not configured' }, { status: 500 });

    const state = crypto.randomBytes(16).toString('hex');
    const scope = encodeURIComponent('orders.read resthooks.write');
    const authUrl = `https://api.youcan.shop/oauth/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

    const res = NextResponse.redirect(authUrl);
    // Set state cookie for CSRF protection
    const cookie = `youcan_oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax`;
    res.headers.set('Set-Cookie', cookie);
    return res;
}
