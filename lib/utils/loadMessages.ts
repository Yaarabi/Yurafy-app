// Shallow Object.assign would overwrite entire namespaces when multiple files share keys (e.g., whatsapp.json + conversations.json).
function isPlainObject(value: unknown): value is Record<string, any> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeDeep(target: Record<string, any>, source: Record<string, any>) {
    for (const key of Object.keys(source)) {
        const sourceVal = source[key];
        const targetVal = target[key];

        if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
            mergeDeep(targetVal, sourceVal);
        } else {
            target[key] = sourceVal;
        }
    }

    return target;
}

// Helper to load all modular message files for a locale
export async function loadMessages(locale: string) {
    const messages: Record<string, any> = {};
    
    const messageFiles = [
        'home', 'auth', 'nav', 'footer', 'dashboard', 'orders', 'products', 
        'customers', 'settings', 'whatsapp', 'whatsappPage', 'conversations', 
        'agent', 'automation', 'support', 'shop', 'resources', 'blog', 'faqs', 
        'terms', 'guides', 'services', 'admin-guides', 'admin-services', 
        'other', 'unmapped'
    ];
    
    for (const file of messageFiles) {
        try {
            // Dynamic require for server-side JSON loading
            const content = require(`../../messages/${locale}/${file}.json`);
            mergeDeep(messages, content);
        } catch (error) {
            // Skip missing files silently
        }
    }
    
    return messages;
}
