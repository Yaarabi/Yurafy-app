
import { getOwnerByBrand } from "../data/owner"; 

export async function generateOwnerMetadata(brand: string) {
    const owner = await getOwnerByBrand(brand);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yurait.vercel.app';

    if (!owner) {
        return {
        title: 'Store Not Found | Yura',
        description: 'This store could not be found.',
        };
    }

    const title = `${owner.brandName || owner.name} | Yura Store`;
    const description = `Discover products from ${owner.brandName || owner.name}, your trusted online store powered by Yura.`;

    return {
        title,
        description,
        openGraph: {
        title,
        description,
        images: owner.logo ? [owner.logo] : [`${baseUrl}/og-default.jpg`],
        url: `${baseUrl}/store/${owner.brandName}`,
        },
        twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: owner.logo ? [owner.logo] : [`${baseUrl}/og-default.jpg`],
        },
    };
}
