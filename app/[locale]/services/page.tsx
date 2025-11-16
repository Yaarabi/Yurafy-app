import ServicesClient from '@/components/services/ServicesClient';
import Footer from '@/components/home/Footer';
import { getTranslations } from 'next-intl/server';

// Helper to get translated services
async function getServicesData(locale: string) {
    const t = await getTranslations({ locale, namespace: 'services' });
    
    return [
        {
            id: 'basic-store',
            type: t('basicStore.type'),
            description: t('basicStore.description'),
            priceMin: 1500,
            priceMax: 3500,
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
            priceMin: 3500,
            priceMax: 6000,
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
            priceMin: 3500,
            priceMax: 6000,
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
            priceMin: 6000,
            priceMax: 8000,
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
            priceMin: 7000,
            priceMax: 10000,
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
