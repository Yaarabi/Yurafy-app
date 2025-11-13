import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db/mongoDB';
import { getAllStores } from '@/lib/data/store';
import { getProductsByOwner } from '@/lib/data/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    await connectDB();
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'https://yurafy.com';
    const domainPart = process.env.NEXT_PUBLIC_DOMAIN || 'yurafy.com';
    
    const sitemap: MetadataRoute.Sitemap = [
        {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
        },
        {
        url: `${baseUrl}/en/login`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
        },
        {
        url: `${baseUrl}/en/signup`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
        },
    ];

    try {
        // Get all stores
        const stores = await getAllStores();
        
        for (const store of stores) {
        const storeUrl = `https://${store.domain}.${domainPart}`;
        
        // Add store homepage
        sitemap.push({
            url: storeUrl,
            lastModified: new Date(store.updatedAt),
            changeFrequency: 'weekly',
            priority: 0.8,
        });

        // Get products for this store
        try {
            const products = await getProductsByOwner(store.owner);
            
            for (const product of products) {
            sitemap.push({
                url: `${storeUrl}/shop/${product.slug}`,
                lastModified: new Date(product.updatedAt || product.createdAt),
                changeFrequency: 'weekly',
                priority: 0.7,
            });
            }
        } catch (err) {
            console.error(`Error fetching products for store ${store.domain}:`, err);
        }
        }
    } catch (err) {
        console.error('Error generating sitemap:', err);
    }

    return sitemap;
}
