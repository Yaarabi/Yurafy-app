import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
    try {
        const clientId = process.env.YOUCAN_CLIENT_ID;
        const redirectUri = process.env.YOUCAN_REDIRECT_URL;
        if (!clientId || !redirectUri)
        return NextResponse.json({ error: "YouCan app not configured" }, { status: 500 });

        const state = crypto.randomBytes(16).toString("hex");
        const scope = encodeURIComponent("orders.read rest-hooks.edit");
        const authUrl = `https://api.youcan.shop/oauth/authorize?response_type=code&client_id=${encodeURIComponent(
        clientId
        )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

        const res = NextResponse.redirect(authUrl);

        res.cookies.set({
        name: "youcan_oauth_state",
        value: state,
        httpOnly: true,
        path: "/",
        maxAge: 600,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        });

        res.headers.set("Cache-Control", "no-store"); // prevent 304 caching

        return res;
    } catch (err) {
        console.error("YouCan connect error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
