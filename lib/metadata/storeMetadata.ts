import { connectDB } from "../db/mongoDB";
import { getStoreByDomain } from "../data/store";

export async function generateStoreMetadata(domain: string) {
    await connectDB();

    const store = await getStoreByDomain(domain);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yurait.vercel.app";
    const domainPart = process.env.NEXT_PUBLIC_DOMAIN || "yurait.vercel.app";

    if (!store) {
        return {
            title: "Store Not Found | Yura",
            description: "This store could not be found.",
        };
    }

    const title = `${store.brandName} | Yura Store`;
    const description =
        store.description ||
        `Discover products from ${store.brandName}, your trusted online store powered by Yura.`;

    const logo = store.logoUrl?.startsWith("http")
        ? store.logoUrl
        : `${baseUrl}${store.logoUrl || "/og-default.jpg"}`;

    // Use subdomain URL format: https://[domain].[main-domain] instead of path-based
    // Example: https://my-store.yurait.vercel.app instead of https://yurait.vercel.app/my-store
    const storeUrl = `https://${store.domain}.${domainPart}`;

    // const themeColor = store.theme?.primaryColor || "#22c55e";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: storeUrl,
            images: [logo],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [logo],
        },
    };
}
