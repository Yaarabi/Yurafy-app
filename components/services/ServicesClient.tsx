"use client";

import { useState } from 'react';
import ServicesHero from './ServicesHero';
import ServiceCard from './ServiceCard';
import ServicesCTA from './ServicesCTA';
import ServiceForm from './ServiceForm';

export interface Service {
    id: string;
    type: string;
    description: string;
    priceMin: number;
    priceMax: number;
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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" dir={isArabic ? 'rtl' : 'ltr'}>
            <ServicesHero locale={locale} />

            <section id="services" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-20">
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

            <ServicesCTA onRequestQuote={handleRequestQuote} />

            <ServiceForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                services={services}
                initialServiceType={selectedServiceType}
            />
        </div>
    );
}
