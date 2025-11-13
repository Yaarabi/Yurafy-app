import { Metadata } from 'next';
import ServicesClient from './ServicesClient';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'https://yurafy.com';

    const titles: Record<string, string> = {
        en: 'Web Development Services - Yurafy',
        fr: 'Services de Développement - Yurafy',
        ar: 'خدمات تطوير الويب - Yurafy',
    };

    const descriptions: Record<string, string> = {
        en: 'Professional web development services. E-commerce stores, WhatsApp automation, delivery API integration, and AI chatbots. Prices from 2,000 MAD.',
        fr: 'Services de développement web professionnel. Boutiques e-commerce, automatisation WhatsApp, intégration API de livraison et chatbots IA. À partir de 2 000 MAD.',
        ar: 'خدمات تطوير ويب احترافية. متاجر إلكترونية، أتمتة واتساب، تكامل API التوصيل، وروبوتات الدردشة بالذكاء الاصطناعي. من 2000 درهم.',
    };

    const title = titles[locale] || titles.en;
    const description = descriptions[locale] || descriptions.en;

    return {
        metadataBase: new URL(baseUrl),
        title,
        description,
        keywords: 'web development Morocco, e-commerce Morocco, WhatsApp automation, COD system, delivery API, AI chatbot, développement web Maroc, تطوير المواقع المغرب',
        alternates: {
            canonical: `${baseUrl}/${locale}/services`,
            languages: {
                en: `${baseUrl}/en/services`,
                fr: `${baseUrl}/fr/services`,
                ar: `${baseUrl}/ar/services`,
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
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

// Service data
export const services = [
    {
        id: 'basic-store',
        type: 'Basic Store',
        description: 'Product listing, COD checkout form, dashboard (no automation)',
        priceMin: 2000,
        priceMax: 4000,
        features: [
            'Product catalog',
            'COD checkout form',
            'Basic admin dashboard',
            'Mobile responsive design',
            'SEO optimization',
        ],
        icon: 'FaShoppingCart',
        color: 'from-[var(--brand-blue)] to-blue-600',
    },
    {
        id: 'whatsapp-auto',
        type: 'Store + WhatsApp Auto Reply',
        description: 'WhatsApp API setup, templates, order confirmation messages',
        priceMin: 4000,
        priceMax: 7000,
        features: [
            'Everything in Basic Store',
            'WhatsApp Business API setup',
            'Automated message templates',
            'Order confirmation via WhatsApp',
            'Customer notifications',
        ],
        icon: 'FaWhatsapp',
        color: 'from-[var(--brand-blue)] to-blue-700',
    },
    {
        id: 'delivery-api',
        type: 'Store + Delivery API Integration',
        description: 'Connect store to Levo, Amana, or other courier APIs',
        priceMin: 6000,
        priceMax: 9000,
        features: [
            'Everything in Basic Store',
            'Levo/Amana API integration',
            'Automated shipping labels',
            'Real-time tracking',
            'Bulk order processing',
        ],
        icon: 'FaTruck',
        color: 'from-[var(--brand-blue)] to-blue-800',
    },
    {
        id: 'full-cod',
        type: 'Full COD System (Automation)',
        description: 'Store + WhatsApp + delivery + dashboard',
        priceMin: 9000,
        priceMax: 13000,
        features: [
            'Complete e-commerce solution',
            'WhatsApp automation',
            'Delivery API integration',
            'Advanced analytics dashboard',
            'Order management system',
            'Payment tracking',
        ],
        icon: 'FaBolt',
        color: 'from-[var(--brand-blue)] to-indigo-600',
        popular: true,
    },
    {
        id: 'ai-agent',
        type: 'AI WhatsApp Agent Integration',
        description: 'Custom OpenAI or Dialogflow agent, order management & training',
        priceMin: 13000,
        priceMax: 18000,
        features: [
            'Everything in Full COD System',
            'Custom AI chatbot (OpenAI/Dialogflow)',
            'Natural language understanding',
            'Automated customer support',
            'Order management via chat',
            'Agent training & optimization',
        ],
        icon: 'FaRobot',
        color: 'from-[var(--brand-blue)] to-blue-900',
    },
];

// Structured data for SEO
const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Web Development Services - Yurafy',
    description: 'Professional web development services in Morocco',
    provider: {
        '@type': 'Organization',
        name: 'Yurafy',
        url: 'https://yurafy.com',
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+212-600-000-000',
            contactType: 'Customer Service',
            areaServed: 'MA',
            availableLanguage: ['en', 'fr', 'ar'],
        },
    },
    offers: services.map((service) => ({
        '@type': 'Offer',
        name: service.type,
        description: service.description,
        priceRange: `${service.priceMin}-${service.priceMax} MAD`,
        priceCurrency: 'MAD',
    })),
};

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <Header />
            <ServicesClient locale={locale} services={services} />
            <Footer />
        </>
    );
}
