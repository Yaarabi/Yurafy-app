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
    ];
}

// Server-side data fetch for guides
async function getServicesGuide() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/guides/public?category=services`, { 
            next: { revalidate: 3600 }
        });
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data.guides) && data.guides.length > 0 ? data.guides[0] : null;
    } catch (error) {
        console.error('Failed to fetch guide:', error);
        return null;
    }
}

// Server-side data fetch for projects
async function getProjects() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/projects`, { 
            next: { revalidate: 3600 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.projects || [];
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        return [];
    }
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const [services, guide, projects] = await Promise.all([
        getServicesData(locale),
        getServicesGuide(),
        getProjects(),
    ]);
    
    return (
        <>
            <ServicesClient locale={locale} services={services} initialGuide={guide} initialProjects={projects} />                            
            <Footer />
        </>
    );
}
