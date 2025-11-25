"use client";

import { motion } from "framer-motion";
import LogoLoader from "@/components/themePreview/loadder";
import { useUserFeatures } from "@/hooks/useUserFeatures";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Store } from "lucide-react";
import StoreCard from "@/components/dashboard/integrations/stores/StoreCard";

export default function StoresIntegrationsPage() {
    const { data, loading, error } = useUserFeatures();
    const t = useTranslations("dashboard");

    const params = useParams();
    const router = useRouter();

    if (loading) return <LogoLoader />;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Page Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/${params.locale}/dashboard/integrations`)}
                        className="flex items-center justify-center w-9 h-9 rounded-xl 
                                    text-gray-600 dark:text-gray-300 
                                    hover:bg-gray-200 dark:hover:bg-gray-800
                                    transition-colors"
                        aria-label="Back"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="w-10 h-10 rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]
                                    flex items-center justify-center">
                        <Store className="w-5 h-5" />
                    </div>

                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {t("integrations.categories.stores.title")}
                    </h1>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {t("integrations.categories.stores.description")}
                </p>

                {/* Integrations Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    <StoreCard
                        name={t('integrations.providers.shopify.name')}
                        description={t('integrations.providers.shopify.description')}
                        icon="https://cdn.simpleicons.org/shopify/7AB55C"
                        onClick={() => router.push(`/${params.locale}/dashboard/integrations/stores/connect/shopify`)}
                        iconBg="bg-gradient-to-br from-green-100 to-green-50 dark:from-transparent"
                    />

                    <StoreCard
                        name={t('integrations.providers.woocommerce.name')}
                        description={t('integrations.providers.woocommerce.description')}
                        icon="https://cdn.simpleicons.org/woocommerce/96588A"
                        onClick={() => router.push(`/${params.locale}/dashboard/integrations/stores/connect/woocommerce`)}
                        iconBg="bg-purple-50 dark:bg-transparent"
                    />

                    <StoreCard
                        name={t('integrations.providers.youcan.name')}
                        description={t('integrations.providers.youcan.description')}
                        icon="https://khamsat.hsoubcdn.com/images/services/2777808/df2fd04728e150af95fbc868ac35135d.jpg"
                        onClick={() => router.push(`/${params.locale}/dashboard/integrations/stores/connect/youcan`)}
                        iconBg="bg-gray-50 dark:bg-transparent"
                    />

                </div>

            </div>
        </div>
    );
}
