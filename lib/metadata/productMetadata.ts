import { getProductWithOwnerBySlug } from '@/lib/data/products';

export async function generateProductMetadata(slug: string) {
    const { product, owner } = await getProductWithOwnerBySlug(slug);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yurait.vercel.app/';

    if (!product) {
        return {
        title: 'Product not found | Yura IT',
        description: 'This product could not be found.',
        };
    }

    return {
        title: `${product.name} | ${owner?.brandName || 'Yura IT'}`,
        description: product.description || 'Shop the best products on Yura IT',
        openGraph: {
        title: product.name,
        description: product.description || '',
        images: product.mainImage ? [product.mainImage] : [],
        url: `${baseUrl}/shop/${product.slug}`,
        },
        twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description || '',
        images: product.mainImage ? [product.mainImage] : [],
        },
    };
}
