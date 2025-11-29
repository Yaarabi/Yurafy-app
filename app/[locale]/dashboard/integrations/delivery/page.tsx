"use client";

import LogoLoader from "@/components/themePreview/loadder";
import { useUserFeatures } from "@/hooks/useUserFeatures";
import { useTranslations } from "next-intl";
import { Truck, ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import AmeexCard from '@/components/dashboard/integrations/delivery/AmeexCard';

export default function DeliveryIntegrationsPage() {
    const { data, loading, error } = useUserFeatures();
    const t = useTranslations("dashboard");

    const params = useParams();
    const router = useRouter();

    if (loading) return <LogoLoader />;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => router.push(`/${params.locale}/dashboard/integrations`)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="Back to Integrations"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] flex items-center justify-center">
                        <Truck className="w-5 h-5" />
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("integrations.categories.delivery.title")}</h1>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{t("integrations.categories.delivery.description")}</p>

                {/* Ameex card */}
                <div className="mt-6">
                    {/* lazy-loadable client component */}
                    <AmeexCard />
                </div>
            </div>
        </div>
    );
}

