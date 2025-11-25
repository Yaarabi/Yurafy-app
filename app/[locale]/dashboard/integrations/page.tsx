"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import LogoLoader from "@/components/themePreview/loadder";
import { useUserFeatures } from "@/hooks/useUserFeatures";
import { useTranslations } from "next-intl";
import { Store, Truck } from "lucide-react";
import { MdExtension } from "react-icons/md";
import IntegrationCard from "@/components/dashboard/integrations/IntegrationCard";

export default function IntegrationsPage() {
    const { data: featuresData, loading, error } = useUserFeatures();
    const t = useTranslations("dashboard");

    useEffect(() => {}, []);

    if (loading) return <LogoLoader />;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 sm:mb-12"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-md 
                            bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]">
                            <MdExtension size={22} />
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-semibold 
                            text-gray-900 dark:text-gray-100">
                            {t("integrations.title")}
                        </h1>
                    </div>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {t("integrations.subtitle")}
                    </p>
                </motion.div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    {/* Stores Card */}
                    <IntegrationCard
                        icon={<Store className="w-5 h-5" />}
                        title={t("integrations.categories.stores.title")}
                        description={t("integrations.categories.stores.description")}
                        link={`/dashboard/integrations/stores`}
                        linkLabel={t("integrations.categories.stores.manage")}
                    />

                    {/* Delivery Card */}
                    <IntegrationCard
                        icon={<Truck className="w-5 h-5" />}
                        title={t("integrations.categories.delivery.title")}
                        description={t("integrations.categories.delivery.description")}
                        link={`/dashboard/integrations/delivery`}
                        linkLabel={t("integrations.categories.delivery.manage")}
                    />

                </div>
            </div>
        </div>
    );
}
