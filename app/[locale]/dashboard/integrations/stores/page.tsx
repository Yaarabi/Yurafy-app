"use client";

import { motion } from "framer-motion";
import LogoLoader from "@/components/themePreview/loadder";
import { useUserFeatures } from "@/hooks/useUserFeatures";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Store } from "lucide-react";
import StoreCard from "@/components/dashboard/integrations/stores/StoreCard";
import ShopifyWebhookSetup from "@/components/dashboard/integrations/stores/ShopifyWebhookSetup";
import WooWebhookSetup from "@/components/dashboard/integrations/stores/WooWebhookSetup";
import YouCanWebhookSetup from "@/components/dashboard/integrations/stores/YouCanWebhookSetup";
import { useEffect, useState } from "react";

export default function StoresIntegrationsPage() {
    const { data, loading, error } = useUserFeatures();
    const t = useTranslations("dashboard");

    const params = useParams();
    const router = useRouter();
    const [showShopifySetup, setShowShopifySetup] = useState(false);
    const [shopifyConnected, setShopifyConnected] = useState<boolean | undefined>(undefined);
    const [showWooSetup, setShowWooSetup] = useState(false);
    const [wooConnected, setWooConnected] = useState<boolean | undefined>(undefined);
    const [showYouCanSetup, setShowYouCanSetup] = useState(false);
    const [youcanConnected, setYoucanConnected] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        let mounted = true;
        fetch('/api/webhooks/shopify/store')
            .then(async (res) => {
                if (!res.ok) {
                    if (mounted) setShopifyConnected(false);
                    return;
                }
                const d = await res.json();
                if (mounted) setShopifyConnected(!!d.store?.connect);
            })
            .catch(() => { if (mounted) setShopifyConnected(false); });
        return () => { mounted = false };
    }, []);

    useEffect(() => {
        let mounted = true;
        fetch('/api/webhooks/woocommerce/store')
            .then(async (res) => {
                if (!res.ok) {
                    if (mounted) setWooConnected(false);
                    return;
                }
                const d = await res.json();
                if (mounted) setWooConnected(!!d.store?.connect);
            })
            .catch(() => { if (mounted) setWooConnected(false); });
        return () => { mounted = false };
    }, []);

    useEffect(() => {
        let mounted = true;
        fetch('/api/webhooks/youcan/store')
            .then(async (res) => {
                if (!res.ok) { if (mounted) setYoucanConnected(false); return; }
                const d = await res.json(); if (mounted) setYoucanConnected(!!d.store?.connect);
            })
            .catch(() => { if (mounted) setYoucanConnected(false); });
        return () => { mounted = false };
    }, []);

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

                    <div>
                        <StoreCard
                            name={t('integrations.providers.shopify.name')}
                            description={t('integrations.providers.shopify.description')}
                            icon="https://cdn.simpleicons.org/shopify/7AB55C"
                            onClick={() => setShowShopifySetup(true)}
                            iconBg="bg-gradient-to-br from-green-100 to-green-50 dark:from-transparent"
                            connected={shopifyConnected}
                        />

                        {showShopifySetup && (
                            <ShopifyWebhookSetup onClose={() => { setShowShopifySetup(false); /* refresh status */ fetch('/api/webhooks/shopify/store').then(r=>r.ok?r.json().then(d=>setShopifyConnected(!!d.store?.connect)):setShopifyConnected(false)).catch(()=>setShopifyConnected(false)); }} />
                        )}
                    </div>

                    <div>
                        <StoreCard
                            name={t('integrations.providers.woocommerce.name')}
                            description={t('integrations.providers.woocommerce.description')}
                            icon="https://cdn.simpleicons.org/woocommerce/96588A"
                            onClick={() => setShowWooSetup(true)}
                            iconBg="bg-purple-50 dark:bg-transparent"
                            connected={wooConnected}
                        />

                        {showWooSetup && (
                            <WooWebhookSetup onClose={() => { setShowWooSetup(false); /* refresh status */ fetch('/api/webhooks/woocommerce/store').then(r=>r.ok?r.json().then(d=>setWooConnected(!!d.store?.connect)):setWooConnected(false)).catch(()=>setWooConnected(false)); }} />
                        )}
                    </div>

                    <div>
                        <StoreCard
                            name={t('integrations.providers.youcan.name')}
                            description={t('integrations.providers.youcan.description')}
                            icon="https://khamsat.hsoubcdn.com/images/services/2777808/df2fd04728e150af95fbc868ac35135d.jpg"
                            onClick={() => setShowYouCanSetup(true)}
                            iconBg="bg-gray-50 dark:bg-transparent"
                            connected={youcanConnected}
                        />

                        {showYouCanSetup && (
                            <YouCanWebhookSetup onClose={() => { setShowYouCanSetup(false); /* refresh status */ fetch('/api/webhooks/youcan/store').then(r=>r.ok?r.json().then(d=>setYoucanConnected(!!d.store?.connect)):setYoucanConnected(false)).catch(()=>setYoucanConnected(false)); }} />
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}
