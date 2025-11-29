// Use global `fetch` and web `FormData` (Node 18+ / Next.js). Timeout is handled
// with an AbortController.
import fs from 'fs';
import path from 'path';

export type AmeexProduct = { id: string; qty?: number };

// Load city mapping from `public/citys.json` once and cache it.
let CITYS_CACHE: Record<string, string> | null = null;
function loadCitys(): Record<string, string> {
    if (CITYS_CACHE) return CITYS_CACHE;
    try {
        const jsonPath = path.join(process.cwd(), 'public', 'citys.json');
        const raw = fs.readFileSync(jsonPath, 'utf8');
        CITYS_CACHE = JSON.parse(raw);
    } catch (e) {
        CITYS_CACHE = {};
    }
    return CITYS_CACHE ?? {};
}

/**
 * Find the city id (key) for a given city name.
 * Returns the id as string or null when not found.
 */
export function getCityIdByName(name?: string | number | null): string | null {
    if (name === undefined || name === null) return null;
    if (typeof name === 'number') return String(name);
    const map = loadCitys();
    const normalized = String(name).toLowerCase().trim();
    // Exact match first
    for (const [id, label] of Object.entries(map)) {
        if (String(label).toLowerCase().trim() === normalized) return id;
    }
    // Partial contains match
    for (const [id, label] of Object.entries(map)) {
        if (String(label).toLowerCase().includes(normalized) || normalized.includes(String(label).toLowerCase().trim())) return id;
    }
    return null;
}

export async function ameexAddParcel(opts: {
    apiId: string;
    apiKey: string;
    business: string | number;
    receiver: string;
    phone: string;
    city: string | number;
    address: string;
    cod: string | number;
    order_num?: string;
    replace?: 'true' | 'false';
    exchange_code?: string;
    open?: 'YES' | 'NO';
    tryFlag?: 'YES' | 'NO';
    fragile?: '0' | '1';
    comment?: string;
    product?: string;
    products?: AmeexProduct[];
    // Optional sender selection (Ameex may require choosing an expéditeur/sender)
    sender?: string;
    sender_id?: string;
    }) {
    const url =
        'https://api.ameex.app/customer/Delivery/Parcels/Action/Type/Add';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
        const form = new FormData();

        // Required defaults (mirror Ameex cURL)
        form.append('type', 'SIMPLE');
        form.append('business', String(opts.business));
        form.append('replace', opts.replace ?? 'true');
        form.append('open', opts.open ?? 'YES');
        form.append('try', opts.tryFlag ?? 'YES');
        form.append('fragile', opts.fragile ?? '0');

        // Optional fields
        if (opts.order_num) form.append('order_num', String(opts.order_num));
        if (opts.exchange_code)
        form.append('exchange_code', opts.exchange_code);

        // Required customer info
        form.append('receiver', opts.receiver);
        form.append('phone', String(opts.phone));
        // Map city names to Ameex city ids using public/citys.json when possible
        const cityCandidates = opts.city;
        const mapped = typeof cityCandidates === 'string' ? getCityIdByName(cityCandidates) : null;
        const cityToSend = mapped ?? String(cityCandidates);
        form.append('city', String(cityToSend));
        form.append('address', opts.address);

        // Optionals
        if (opts.comment) form.append('comment', opts.comment);
        if (opts.product) form.append('product', opts.product);

        // COD is required
        form.append('cod', String(opts.cod));

        // Sender selection (some Ameex accounts require choosing an expéditeur/sender)
        if (opts.sender) form.append('sender', String(opts.sender));
        if (opts.sender_id) form.append('sender_id', String(opts.sender_id));

        // Products array
        if (Array.isArray(opts.products)) {
        opts.products.forEach((p, i) => {
            form.append(`products[${i}][id]`, p.id);
            if (p.qty !== undefined)
            form.append(`products[${i}][qty]`, String(p.qty));
        });
        }

        const headers: Record<string, string> = {
        'C-Api-Id': opts.apiId,
        'C-Api-Key': opts.apiKey,
        };

        const res = await fetch(url, {
        method: 'POST',
        body: form as any,
        headers,
        signal: controller.signal,
        });

        const text = await res.text().catch(() => '');
        return { status: res.status, body: text };
    } finally {
        clearTimeout(timeout);
    }
}
