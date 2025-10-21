import { connectDB } from "../db/mongoDB";
import { getStoreByDomain } from "../data/store";

export async function generateStoreMetadata(domain: string) {
    await connectDB();

    const store = await getStoreByDomain(domain);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yurait.vercel.app";

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

    // const themeColor = store.theme?.primaryColor || "#22c55e";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `${baseUrl}/${store.domain}`,
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
