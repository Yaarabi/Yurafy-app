import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'https://yurafy.com';

    const titles: Record<string, string> = {
        en: 'Web Development Services - Yurafy',
        fr: 'Services de Développement Web - Yurafy',
        ar: 'خدمات تطوير الويب - Yurafy',
    };

    const descriptions: Record<string, string> = {
        en: 'Professional web development services in Morocco. E-commerce stores, WhatsApp automation, delivery API integration, and AI chatbots. Prices from 1,500 MAD.',
        fr: 'Services de développement web professionnel au Maroc. Boutiques e-commerce, automatisation WhatsApp, intégration API de livraison et chatbots IA. À partir de 1 500 MAD.',
        ar: 'خدمات تطوير ويب احترافية في المغرب. متاجر إلكترونية، أتمتة واتساب، تكامل API التوصيل، وروبوتات الدردشة بالذكاء الاصطناعي. من 1500 درهم.',
    };

    const title = titles[locale] || titles.en;
    const description = descriptions[locale] || descriptions.en;

    return {
        metadataBase: new URL(baseUrl),
        title,
        description: description || 'Professional web development services in Morocco',
        keywords: [
            'web development Morocco', "WordPress",
            'e-commerce Morocco', 'موقع إلكتروني',
            'WhatsApp automation',
            'COD system',
            'delivery API',
            'AI chatbot Morocco',
            'développement web Maroc',
            'boutique en ligne Maroc',
            'تطوير المواقع المغرب',
            'متجر إلكتروني المغرب',
            'Yurafy services',
            'Web development services',
            'professional',
            'dev',
            'Morocco SaaS',
            'YouCan',
            'Shopify',
            'WooCommerce',
            'MERN',
            'Next.js',
            'Nest.js',
        ].join(', '),
        authors: [{ name: 'Yurafy' }],
        creator: 'Yurafy',
        publisher: 'Yurafy',
        alternates: {
            canonical: `${baseUrl}/${locale}/services`,
            languages: {
                'en': `${baseUrl}/en/services`,
                'fr': `${baseUrl}/fr/services`,
                'ar': `${baseUrl}/ar/services`,
                'x-default': `${baseUrl}/en/services`,
            },
        },
        openGraph: {
            type: 'website',
            locale: locale === 'en' ? 'en_US' : locale === 'fr' ? 'fr_FR' : 'ar_AR',
            url: `${baseUrl}/${locale}/services`,
            siteName: 'Yurafy',
            title,
            description,
            images: [
                {
                    url: `${baseUrl}/og-services.png`,
                    width: 1200,
                    height: 630,
                    alt: 'Yurafy Web Development Services',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`${baseUrl}/og-services.png`],
            creator: '@yurafy',
            site: '@yurafy',
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        verification: {
            google: process.env.GOOGLE_SITE_VERIFICATION,
        },
    };
}

async function getServicesForSchema(locale: string) {
    const t = await getTranslations({ locale, namespace: 'services' });
    
    return [
        {
            id: 'basic-store',
            type: t('basicStore.type'),
            description: t('basicStore.description'),
            priceMin: 1500,
            priceMax: 3500,
        },
        {
            id: 'whatsapp-auto',
            type: t('whatsappAuto.type'),
            description: t('whatsappAuto.description'),
            priceMin: 3500,
            priceMax: 6000,
        },
        {
            id: 'delivery-api',
            type: t('deliveryApi.type'),
            description: t('deliveryApi.description'),
            priceMin: 3500,
            priceMax: 6000,
        },
        {
            id: 'full-cod',
            type: t('fullCod.type'),
            description: t('fullCod.description'),
            priceMin: 6000,
            priceMax: 8000,
        },
        {
            id: 'ai-agent',
            type: t('aiAgent.type'),
            description: t('aiAgent.description'),
            priceMin: 7000,
            priceMax: 10000,
        },
    ];
}

export default async function ServicesLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const services = await getServicesForSchema(locale);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'https://yurafy.com';

    // Schema.org structured data
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage', 
        '@id': `${baseUrl}/${locale}/services#webpage`,
        url: `${baseUrl}/${locale}/services`,
        name: locale === 'en' ? 'Web Development Services - Yurafy' : locale === 'fr' ? 'Services de Développement Web - Yurafy' : 'خدمات تطوير الويب - Yurafy',
        description: locale === 'en' ? 'Professional web development services in Morocco' : locale === 'fr' ? 'Services de développement web professionnel au Maroc' : 'خدمات تطوير ويب احترافية في المغرب',
        inLanguage: locale,
        isPartOf: {
            '@type': 'WebSite',
            '@id': `${baseUrl}#website`,
            url: baseUrl,
            name: 'Yurafy',
        },
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: `${baseUrl}/${locale}`,
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Services',
                    item: `${baseUrl}/${locale}/services`,
                },
            ],
        },
        provider: {
            '@type': 'Organization',
            '@id': `${baseUrl}#organization`,
            name: 'Yurafy',
            url: baseUrl,
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/logo.png`,
                width: 200,
                height: 200,
            },
            contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+212-716413605',
                contactType: 'Customer Service',
                areaServed: 'MA',
                availableLanguage: ['English', 'French', 'Arabic'],
            },
            sameAs: [
                'https://twitter.com/yurafy',
                'https://facebook.com/yurafy',
                'https://linkedin.com/company/yurafy',
            ],
        },
        offers: services.map((service, index) => ({
            '@type': 'Offer',
            '@id': `${baseUrl}/${locale}/services#offer-${service.id}`,
            name: service.type,
            description: service.description,
            price: service.priceMin,
            priceCurrency: 'MAD',
            priceRange: `${service.priceMin}-${service.priceMax}`,
            availability: 'https://schema.org/InStock',
            itemOffered: {
                '@type': 'Service',
                name: service.type,
                description: service.description,
                provider: {
                    '@id': `${baseUrl}#organization`,
                },
            },
        })),
    };

    // Schema.org WebSite entity
    const structuredWebsite = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${baseUrl}#website`,
        url: baseUrl,
        name: 'Yurafy',
        inLanguage: locale,
        publisher: {
            '@type': 'Organization',
            '@id': `${baseUrl}#organization`,
        },
        potentialAction: [
            {
                '@type': 'SubscribeAction',
                target: `${baseUrl}/${locale}/services`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredWebsite) }}
            />
            {children}
        </>
    );
}
