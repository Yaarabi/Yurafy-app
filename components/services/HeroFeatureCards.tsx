"use client";

import { ShoppingCart, MessageCircle, Truck, Users, LucideIcon } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface Feature {
    icon: LucideIcon;
    titleKey: string;
    descKey: string;
    gradient: string;
}

export default function HeroFeatureCards() {
    const t = useTranslations('services');
    const locale = useLocale();
    const isRTL = locale === 'ar';

    const features: Feature[] = [
        { 
            icon: ShoppingCart, 
            titleKey: 'hero.features.codCheckout.title', 
            descKey: 'hero.features.codCheckout.description',
            gradient: 'from-blue-500 to-cyan-500'
        },
        { 
            icon: MessageCircle, 
            titleKey: 'hero.features.whatsappAuto.title', 
            descKey: 'hero.features.whatsappAuto.description',
            gradient: 'from-green-500 to-emerald-500'
        },
        { 
            icon: Truck, 
            titleKey: 'hero.features.deliveryApi.title', 
            descKey: 'hero.features.deliveryApi.description',
            gradient: 'from-orange-500 to-amber-500'
        },
        { 
            icon: Users, 
            titleKey: 'hero.features.teamDashboard.title', 
            descKey: 'hero.features.teamDashboard.description',
            gradient: 'from-purple-500 to-pink-500'
        },
    ];

    return (
        <section className="overflow-hidden py-10 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-gray-900/50 dark:via-gray-950 dark:to-gray-950">
            <div
                className="flex gap-5"
                style={{
                    animation: isRTL ? `scrollRight 50s linear infinite` : `scrollLeft 50s linear infinite`,
                    width: 'fit-content',
                }}
            >
                {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                        <div
                            key={index}
                            className="flex-shrink-0 w-[220px] hover:scale-108 transition-transform duration-300"
                        >
                            <div className="group relative bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 hover:border-transparent transition-all duration-300 h-full shadow-lg hover:shadow-2xl overflow-hidden">
                                {/* Gradient overlay on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />
                                
                                {/* Top accent line */}
                                <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-0 h-1 bg-gradient-to-r ${feature.gradient} group-hover:w-full transition-all duration-500 rounded-full`} />
                                
                                <div className="relative z-10">
                                    {/* Icon Container with gradient */}
                                    <div className={`mb-4 inline-flex p-3 bg-gradient-to-br ${feature.gradient} rounded-xl shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>

                                    {/* Title */}
                                    <h3 className={`text-base font-bold text-gray-900 dark:text-white mb-2 transition-all duration-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t(feature.titleKey)}
                                    </h3>

                                    {/* Description */}
                                    <p className={`text-xs text-gray-600 dark:text-gray-400 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t(feature.descKey)}
                                    </p>
                                </div>

                                {/* Corner decoration */}
                                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} bottom-0 w-16 h-16 bg-gradient-to-br ${feature.gradient} opacity-5 dark:opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-300`} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
