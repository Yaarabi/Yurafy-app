export const revalidate = 3600;

import ServicesClient, { Service } from '@/components/services/ServicesClient';
import Footer from '@/components/home/Footer';
import { getTranslations } from 'next-intl/server';

// Helper to get translated services
async function getServicesData(locale: string): Promise<Service[]> {
    const t = await getTranslations({ locale, namespace: 'services' });
    
    return [
        {
            id: 'basic-store',
            type: t('basicStore.type'),
            description: t('basicStore.description'),
            features: [
                t('basicStore.features.catalog'),
                t('basicStore.features.checkout'),
                t('basicStore.features.dashboard'),
                t('basicStore.features.responsive'),
                t('basicStore.features.seo'),
            ],
            icon: 'FaShoppingCart',
            color: 'from-[var(--brand-blue)] to-blue-600',
        },
        {
            id: 'whatsapp-auto',
            type: t('whatsappAuto.type'),
            description: t('whatsappAuto.description'),
            features: [
                t('whatsappAuto.features.basic'),
                t('whatsappAuto.features.api'),
                t('whatsappAuto.features.templates'),
                t('whatsappAuto.features.confirmation'),
                t('whatsappAuto.features.notifications'),
            ],
            icon: 'FaWhatsapp',
            color: 'from-[var(--brand-blue)] to-blue-700',
        },
        {
            id: 'delivery-api',
            type: t('deliveryApi.type'),
            description: t('deliveryApi.description'),
            features: [
                t('deliveryApi.features.basic'),
                t('deliveryApi.features.integration'),
                t('deliveryApi.features.labels'),
                t('deliveryApi.features.tracking'),
                t('deliveryApi.features.bulk'),
            ],
            icon: 'FaTruck',
            color: 'from-[var(--brand-blue)] to-blue-800',
        },
        {
            id: 'full-cod',
            type: t('fullCod.type'),
            description: t('fullCod.description'),
            features: [
                t('fullCod.features.complete'),
                t('fullCod.features.whatsapp'),
                t('fullCod.features.delivery'),
                t('fullCod.features.team'),
                t('fullCod.features.analytics'),
                t('fullCod.features.orders'),
                t('fullCod.features.payment'),
            ],
            icon: 'FaBolt',
            color: 'from-[var(--brand-blue)] to-indigo-600',
            popular: true,
        },
        {
            id: 'ai-agent',
            type: t('aiAgent.type'),
            description: t('aiAgent.description'),
            features: [
                t('aiAgent.features.fullCod'),
                t('aiAgent.features.chatbot'),
                t('aiAgent.features.nlu'),
                t('aiAgent.features.support'),
                t('aiAgent.features.orderChat'),
                t('aiAgent.features.training'),
            ],
            icon: 'FaRobot',
            color: 'from-[var(--brand-blue)] to-blue-900',
        },
        // New website-related services added to match the ServiceInquiry enum
        {
            id: 'custom-website',
            type: t('customWebsite.type'),
            description: t('customWebsite.description'),
            features: [t('customWebsite.features.design'), t('customWebsite.features.development')],
            icon: 'FaCode',
            color: 'from-[var(--brand-blue)] to-sky-600',
        },
        {
            id: 'wordpress-website',
            type: t('wordpressWebsite.type'),
            description: t('wordpressWebsite.description'),
            features: [t('wordpressWebsite.features.themes'), t('wordpressWebsite.features.plugins')],
            icon: 'FaWordpress',
            color: 'from-[var(--brand-blue)] to-indigo-600',
        },
        {
            id: 'shopify-store',
            type: t('shopifyStore.type'),
            description: t('shopifyStore.description'),
            features: [t('shopifyStore.features.setup'), t('shopifyStore.features.integration')],
            icon: 'FaShopify',
            color: 'from-[var(--brand-blue)] to-green-600',
        },
    ];
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const services = await getServicesData(locale);
    
    return (
        <>
            <ServicesClient locale={locale} services={services} />                            
            <Footer />
        </>
    );
}
