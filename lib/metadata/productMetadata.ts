import { getProductWithStoreBySlug } from '@/lib/data/products';

export async function generateProductMetadata(slug: string) {
    const { product, store } = await getProductWithStoreBySlug(slug);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yurait.vercel.app/';

    if (!product) {
        return {
            title: 'Product not found | Yurafy',
            description: 'This product could not be found.',
            openGraph: {
                title: 'Product not found',
                description: 'This product could not be found.',
                url: `${baseUrl}/${slug}`,
                images: [],
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
        : `${baseUrl}${product.mainImage}`;

    return {
        title: `${product.name} | ${store?.brandName || 'Yurafy'}`,
        description: product.description || 'Shop the best products on Yurafy',
        openGraph: {
            title: product.name,
            description: product.description || '',
            url: `${baseUrl}/${product.slug}`,
            images: ogImage ? [{ url: ogImage }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: product.description || '',
            images: ogImage ? [ogImage] : [],
        },
    };
}
