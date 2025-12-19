import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db/mongoDB';
import { getStoreByDomain } from '@/lib/data/store';
import { getProductsByOwner } from '@/lib/data/products';

export const revalidate = 86400;

export default async function sitemap({
    params,
    }: {
    params: { domain: string; locale: string };
    }): Promise<MetadataRoute.Sitemap> {
    await connectDB();

    const domainPart = process.env.NEXT_PUBLIC_DOMAIN || 'yurafy.com';
    const storeUrl = `https://${params.domain}.${domainPart}`;

    // Always include homepage + shop page
    const sitemap: MetadataRoute.Sitemap = [
        {
        url: storeUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        },
        {
        url: `${storeUrl}/shop`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
        },
    ];

    try {
        const store = await getStoreByDomain(params.domain);

        if (!store) {
        // No store found, return minimal sitemap
        return sitemap;
        }

        // Add products if store exists
        const products = await getProductsByOwner(store.owner);

        for (const product of products) {
        sitemap.push({
            url: `${storeUrl}/shop/${product.slug}`,
            lastModified: new Date(product.updatedAt || product.createdAt),
            changeFrequency: 'weekly',
            priority: 0.6,
        });
        }
    } catch (err) {
        console.error(`Error generating sitemap for store ${params.domain}:`, err);
    }

    return sitemap;
}
