"use client";

import { SerializedStore } from "@/lib/data/store";
import { IProduct } from "@/models/store/products";

interface SeoJsonLdProps {
    store: SerializedStore;
    product?: IProduct;
    storeUrl?: string; // Pass the actual full store URL (subdomain-aware)
}

const SeoJsonLd = ({ store, product, storeUrl }: SeoJsonLdProps) => {
  // Build full store URL - prefer passed storeUrl (subdomain-aware) or construct from env
    const domainPart = process.env.NEXT_PUBLIC_DOMAIN || 'yurait.vercel.app';
    const fullStoreUrl = storeUrl || `https://${store.domain}.${domainPart}`;

    const generateStoreJsonLd = () => {
        const jsonLd: any = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": store.brandName,
        "url": fullStoreUrl,
        "description": store.description,
        };

        if (store.logoUrl) {
        jsonLd.logo = store.logoUrl.startsWith('http') 
            ? store.logoUrl 
            : `${fullStoreUrl}${store.logoUrl}`;
        }

        if (store.socialLinks) {
        jsonLd.sameAs = [];
        if (store.socialLinks.facebook) jsonLd.sameAs.push(store.socialLinks.facebook);
        if (store.socialLinks.instagram) jsonLd.sameAs.push(store.socialLinks.instagram);
        if (store.socialLinks.tiktok) jsonLd.sameAs.push(store.socialLinks.tiktok);
        }

        return jsonLd;
    };

    const generateProductJsonLd = () => {
        if (!product) return null;
        
        const productUrl = `${fullStoreUrl}/shop/${product.slug}`;
        const imageUrl = product.mainImage?.startsWith('http') 
        ? product.mainImage 
        : `${fullStoreUrl}${product.mainImage || '/placeholder-product.jpg'}`;

        return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": imageUrl,
        "description": product.description || `${product.name} from ${store.brandName}`,
        "brand": {
            "@type": "Brand",
            "name": store.brandName,
        },
        "offers": {
            "@type": "Offer",
            "url": productUrl,
            "priceCurrency": "USD",
            "price": product.price,
            "availability": product.stock && product.stock > 0 
            ? "https://schema.org/InStock" 
            : "https://schema.org/OutOfStock",
            "seller": {
            "@type": "Organization",
            "name": store.brandName,
            },
        },
        };
    };

    const jsonLd = product ? generateProductJsonLd() : generateStoreJsonLd();

    return (
        <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
};

export default SeoJsonLd;
