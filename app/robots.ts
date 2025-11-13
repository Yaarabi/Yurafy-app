import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
        "https://yurafy.com";

    const disallow = [
        "/api/",
        "/dashboard/",
        "/admin/",
        "/onboarding/",
        "/verify-email",
        "/forgot-password",
        "/reset-password",
        "/_next/",
    ];

    return {
        rules: [
        {
            userAgent: "*",
            allow: [
            "/",          // Homepage
            "/login",
            "/signup",
            "/services",
            "/support",
            "/en/",        // Locales
            "/fr/",
            "/ar/",
            ],
            disallow,
        },
        {
            userAgent: "Googlebot",
            allow: [
            "/",
            "/login",
            "/signup",
            "/services",
            "/support",
            "/en/",
            "/fr/",
            "/ar/",
            ],
            disallow,
            crawlDelay: 1,
        },
        ],

        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
