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
import Projects from './Projects';
import ServicesFAQ from './ServicesFAQ';
import DifferentIdea from './DifferentIdea';
import SupportChat from './SupportChat';
import Services from './WebServices';
import HeroTechStackLogos from './TechStack';

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
    initialGuide?: { title: string; description: string; videoUrl: string } | null;
    initialProjects?: any[];
}

export default function ServicesClient({ locale, services, initialGuide, initialProjects }: ServicesClientProps) {
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
            <ServicesHero locale={locale} requestQuote={handleRequestQuote} />

            <HeroTechStackLogos />

            {/* Web Services Section */}
            <Services/>

            {/* Projects Section */}
            <Projects locale={locale} initialProjects={initialProjects} />

            <ServicesCTA onRequestQuote={handleRequestQuote} />

            {/* Services Video Section (below hero) */}
            <ServicesVideo initialGuide={initialGuide} />

            <section id="services" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-20">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white" role="heading" aria-level={2}>
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

            {/* Hero Feature Cards */}
            <HeroFeatureCards />

            {/* Conversion Assist Section */}
            <ServicesConversion onRequest={handleRequestQuote} />



            <DifferentIdea onRequest={handleRequestQuote} />

            <ServicesFAQ locale={locale} />

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
