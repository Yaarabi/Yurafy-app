"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileHeader from '@/components/dashboard/setting/profileHeader';
import ProfileSettings from '@/components/dashboard/setting/ProfileSettings';
import PlanSettings from '@/components/dashboard/setting/PlanSettings';
import WhatsAppSettings from '@/components/dashboard/setting/WhatsAppSettings';
import StoreSettings from '@/components/dashboard/setting/StoreSettings';
import TabNavigation from '@/components/dashboard/setting/TabNavigation';
import LocaleSwitcher from '@/components/home/LocaleSwitcher';
import ThemeToggle from '@/components/dashboard/Mode';
import { useParams, useSearchParams } from 'next/navigation';
import LogoLoader from '@/components/themePreview/loadder';
import { User, Package, MessageCircle, Globe, Palette, Crown } from 'lucide-react';
import { useUserFeatures } from '@/hooks/useUserFeatures';
import { useSettingsData } from '@/hooks/settings/useSettingsData';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
    const { data: featuresData, loading, error } = useUserFeatures();
    const { user, whatsapp, store, updateField, updateWhatsAppField, updateStoreField, handleLogoUpload } = useSettingsData(featuresData);
    const searchParams = useSearchParams();
    const params = useParams();
    const t = useTranslations('settings');
    const [activeTab, setActiveTab] = useState('profile');

    const tabIcons: Record<string, any> = {
        profile: User,
        plan: Crown,
        store: Package,
        whatsapp: MessageCircle,
        language: Globe,
        mode: Palette,
    };

    const tabs = useMemo(() => [
        'profile',
        'plan',
        ...(store ? ['store'] : []),
        ...(whatsapp ? ['whatsapp'] : []),
        'language',
        'mode',
    ], [store?._id, whatsapp?._id]);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            const normalizedTab = tabParam.toLowerCase();
            const availableTabs = [
                'profile',
                'plan',
                ...(store ? ['store'] : []),
                ...(whatsapp ? ['whatsapp'] : []),
                'language',
                'mode',
            ];

            if (availableTabs.includes(normalizedTab) && activeTab !== normalizedTab) {
                setActiveTab(normalizedTab);
            }
        }
    }, [searchParams, store?._id, whatsapp?._id, activeTab]);

    if (loading) return <LogoLoader />;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!user) return <p className="text-red-500">User not found</p>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-5xl mx-0 sm:mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 sm:mb-8"
                >
                    <ProfileHeader name={user.username} email={user.email} />
                </motion.div>

                <TabNavigation
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    tabIcons={tabIcons}
                    t={t}
                />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-4 sm:p-6 lg:p-8"
                    >
                        {activeTab === 'profile' && <ProfileSettings user={user} onUpdate={updateField} />}

                        {activeTab === 'plan' && featuresData?.plan && (
                            <PlanSettings
                                plan={{
                                    planKey: featuresData.plan.planKey,
                                    currentPlan: featuresData.plan.currentPlan ? {
                                        endDate: featuresData.plan.currentPlan.endDate?.toString()
                                    } : undefined,
                                    isExpired: featuresData.plan.isExpired
                                }}
                                locale={params.locale as string}
                            />
                        )}

                        {activeTab === 'store' && store && (
                            <StoreSettings
                                store={store}
                                onUpdate={updateStoreField}
                                onUploadLogo={(e) => handleLogoUpload(e, activeTab)}
                                locale={params.locale as string}
                            />
                        )}

                        {activeTab === 'whatsapp' && whatsapp && (
                            <WhatsAppSettings whatsapp={whatsapp} onUpdate={updateWhatsAppField} />
                        )}

                        {activeTab === 'language' && <LocaleSwitcher />}

                        {activeTab === 'mode' && <ThemeToggle />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}