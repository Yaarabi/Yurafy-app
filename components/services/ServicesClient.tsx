"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ServicesHero from './ServicesHero';
import HeroFeatureCards from './HeroFeatureCards';
import ServiceCard from './ServiceCard';
import ServicesCTA from './ServicesCTA';
import ServicesConversion from './ServicesConversion';
import ServiceForm from './ServiceForm';
import ServicesVideo from './ServicesVideo';
import DifferentIdea from './DifferentIdea';
import SupportChat from './SupportChat';

export interface Service {
    id: string;
    type: string;
    description: string;
    features: string[];
    icon: string;
    color: string;
    popular?: boolean;
}

interface ServicesClientProps {
    locale: string;
    services: Service[];
}

export default function ServicesClient({ locale, services }: ServicesClientProps) {
    const t = useTranslations('services');
    const isArabic = locale === 'ar';
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedServiceType, setSelectedServiceType] = useState<string>('');

    const handleGetStarted = (serviceType: string) => {
        setSelectedServiceType(serviceType);
        setIsFormOpen(true);
    };

    const handleRequestQuote = () => {
        setSelectedServiceType('');
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedServiceType('');
    };

    return (
        <div className="min-h-screen" dir={isArabic ? 'rtl' : 'ltr'}>
            <ServicesHero locale={locale} />

            {/* Hero Feature Cards */}
            <HeroFeatureCards />

            {/* Services Video Section (below hero) */}
            <ServicesVideo />

            <section id="services" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-20">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                    {t('servicesTitle')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            index={index}
                            isArabic={isArabic}
                            onGetStarted={handleGetStarted}
                        />
                    ))}
                </div>
            </section>

            {/* Conversion Assist Section */}
            <ServicesConversion onRequest={handleRequestQuote} />

            <ServicesCTA onRequestQuote={handleRequestQuote} />

            <DifferentIdea onRequest={handleRequestQuote} />

            <SupportChat />

            <ServiceForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                services={services}
                initialServiceType={selectedServiceType}
            />
        </div>
    );
}
