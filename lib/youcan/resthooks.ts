

export async function registerWebhook(accessToken: string, token: string) {
    const base = process.env.NEXTAUTH_URL;
    if (!base) throw new Error('NEXTAUTH_URL not configured');
    const targetUrl = `${base.replace(/\/$/, '')}/api/webhooks/youcan/new-order/${token}`;

    const url = 'https://api.youcan.shop/resthooks/subscribe';
    const body = { event: 'order.create', target_url: targetUrl };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) { json = text; }

    if (!res.ok) {
        const details = typeof json === 'string' ? json : JSON.stringify(json);
        const err: any = new Error(`YouCan subscription failed: ${res.status} ${res.statusText} - ${details}`);
        err.status = res.status;
        err.body = json;
        throw err;
    }

    return json; // expected { id: '...' }
}

export async function unregisterWebhook(subscriptionId: string, accessToken: string) {
    const url = 'https://api.youcan.shop/resthooks/unsubscribe';
    const body = { id: subscriptionId };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) { json = text; }

    if (!res.ok) {
        const details = typeof json === 'string' ? json : JSON.stringify(json);
        const err: any = new Error(`YouCan unsubscribe failed: ${res.status} ${res.statusText} - ${details}`);
        err.status = res.status;
        err.body = json;
        throw err;
    }

    return json;
}
