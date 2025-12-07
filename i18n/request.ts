import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

// Shallow Object.assign will overwrite entire namespaces when files share the same root key.
// Merge deeply so split message files (e.g., whatsapp.json and conversations.json) combine instead of clobbering.
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

async function loadMessages(locale: string) {
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
      const content = require(`../messages/${locale}/${file}.json`);
      mergeDeep(messages, content);
    } catch (error) {
      // Silently skip missing files
    }
  }
  
  return messages;
}

export default getRequestConfig(async ({requestLocale}: {requestLocale: Promise<string | undefined>}) => {
  const requested = await requestLocale;
  
  // Use requested locale if valid, otherwise default
  const locale = requested && hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale)
  };
});