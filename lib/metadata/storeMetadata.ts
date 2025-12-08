import { connectDB } from "../db/mongoDB";
import { getStoreByDomain } from "../data/store";
import { buildStoreUrl } from './url';

export async function generateStoreMetadata(domain: string, locale: string = 'en') {
    await connectDB();

    const store = await getStoreByDomain(domain);
    const baseUrlEnv = process.env.NEXT_PUBLIC_BASE_URL || "https://yurafy.com";

    if (!store) {
        return {
            title: "Store Not Found | Yurafy",
            description: "This store could not be found.",
        };
    }

    const title = `${store.brandName}`;
    const description =
        store.description ||
        `Discover products from ${store.brandName}, your trusted online store powered by Yurafy.`;

    const logo = store.logoUrl?.startsWith('http')
        ? store.logoUrl
        : `${baseUrlEnv.replace(/\/$/, '')}${store.logoUrl || '/og-default.jpg'}`;

    const storeUrl = await buildStoreUrl({ locale, storeDomain: store.domain });

    // const themeColor = store.theme?.primaryColor || "#22c55e";

    return {
        metadataBase: new URL(storeUrl),
        title,
        description,
        alternates: {
            canonical: storeUrl,
        },
        openGraph: {
            type: 'website',
            siteName: store.brandName,
            title,
            description,
            url: storeUrl,
            locale,
            images: [
                {
                    url: logo,
                    width: 1200,
                    height: 630,
                    alt: `${store.brandName} logo`
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [logo],
        },
    };
}
