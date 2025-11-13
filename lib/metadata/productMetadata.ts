import { getProductWithStoreBySlug } from '@/lib/data/products';
import { buildProductUrl } from './url';

export async function generateProductMetadata(slug: string, locale: string = 'en') {
    const { product, store } = await getProductWithStoreBySlug(slug);

    const baseUrlEnv = process.env.NEXT_PUBLIC_BASE_URL || 'https://yurafy.com';

    if (!product) {
        const notFoundUrl = `${baseUrlEnv.replace(/\/$/, '')}/products/${encodeURIComponent(slug)}`;
        return {
            title: 'Product not found | Yurafy',
            description: 'This product could not be found.',
            alternates: { canonical: notFoundUrl },
            openGraph: {
                title: 'Product not found',
                description: 'This product could not be found.',
                url: notFoundUrl,
                images: [],
                type: 'article'
            },
            twitter: {
                card: 'summary',
                title: 'Product not found',
                description: 'This product could not be found.',
                images: [],
            },
        };
    }

    const ogImage = product.mainImage?.startsWith('http')
        ? product.mainImage
        : `${baseUrlEnv.replace(/\/$/, '')}${product.mainImage || '/og-product-default.jpg'}`;

    const productUrl = await buildProductUrl({ locale, storeDomain: store?.domain, productSlug: product.slug });

    const title = `${product.name} – ${store?.brandName || 'Yurafy'}`;
    const description = product.description || `Buy ${product.name} from ${store?.brandName || 'Yurafy'}.`;
    return {
        metadataBase: new URL(productUrl),
        title,
        description,
        alternates: { canonical: productUrl },
        openGraph: {
            type: 'website',
            siteName: store?.brandName || 'Yurafy',
            title,
            description,
            url: productUrl,
            locale,
            images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: product.name }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ogImage ? [ogImage] : [],
        },
    };
}
