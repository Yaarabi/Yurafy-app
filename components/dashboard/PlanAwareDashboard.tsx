"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Lock, BarChart3, TrendingUp, ShoppingCart, Package, Users, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import RevenueChart from "@/components/dashboard/home/RevenueChart";
import OrdersStatusChart from "@/components/dashboard/home/OrdersStatusChart";
import TopProductsChart from "@/components/dashboard/home/TopProductsChart";
import CustomersChart from "@/components/dashboard/home/customers";
import Link from "next/link";
import { IOrder } from "@/models/orders";
import { IProduct } from "@/models/products";
import type { UserFeaturesData } from "@/hooks/useUserFeatures";

interface UserPlan {
    planKey: string;
    isExpired: boolean;
    daysRemaining: number;
    limits: {
        maxProducts?: number;
        maxOrders?: number;
        maxContacts?: number;
    };
    usage: {
        products: number;
        orders: number;
        contacts: number;
    };
}

interface DashboardProduct {
    name: string;
    price: number;
    salesCount: number;
}

interface PlanAwareDashboardProps {
    orders: IOrder[];
    products: DashboardProduct[];
    templatesCount?: number;
    featuresData?: UserFeaturesData;
}

export default function PlanAwareDashboard({ orders, products, templatesCount = 0, featuresData }: PlanAwareDashboardProps) {
    const t = useTranslations('dashboard');
    const [storeDomain, setStoreDomain] = useState<string | null>(null);
    const [storeLoading, setStoreLoading] = useState(true);
    
    // Use featuresData if provided, otherwise fall back to plan API (for backward compatibility)
    const planKey = featuresData?.plan?.planKey || "free";
    const userPlan = featuresData?.plan;
    const planFeatures = featuresData?.planFeatures;
    const statistics = featuresData?.statistics;

    const isFreePlan = planKey === "free";
    const isStorePlan = planFeatures?.isStorePlan || planKey === "Starter" || planKey === "Pro Seller" || planKey === "Visionary";
    const isWhatsAppPlan = planFeatures?.isWhatsAppPlan || planKey === "WhatsApp Automation" || planKey === "AI WhatsApp Agent" || planKey === "Pro Seller" || planKey === "Visionary";
    const hasOrders = planFeatures?.hasOrders !== false;
    
    // Calculate days remaining if plan exists
    const daysRemaining = userPlan?.currentPlan?.endDate 
        ? Math.ceil((new Date(userPlan.currentPlan.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;
    const isExpired = daysRemaining < 0;

    // Fetch store domain if user has store plan
    useEffect(() => {
        if (isStorePlan) {
            const fetchStore = async () => {
                try {
                    const res = await fetch('/api/store/owner');
                    if (res.ok) {
                        const data = await res.json();
                        if (data.domain) {
                            setStoreDomain(data.domain);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching store:', error);
                } finally {
                    setStoreLoading(false);
                }
            };
            fetchStore();
        } else {
            setStoreLoading(false);
        }
    }, [isStorePlan]);

    // Build store URL
    const getStoreUrl = (domain: string | null): string | null => {
        if (!domain) return null;
        
        // Extract base domain from current hostname or use environment variable
        let domainPart = "yurait.vercel.app"; // Default fallback
        
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            const parts = hostname.split('.');
            
            // Extract base domain
            // Examples:
            // - "yurait.vercel.app" -> "yurait.vercel.app"
            // - "app.yurait.vercel.app" -> "yurait.vercel.app"
            // - "store.yurait.vercel.app" -> "yurait.vercel.app"
            if (parts.length >= 3) {
                // Remove first part (subdomain) to get base domain
                domainPart = parts.slice(1).join('.');
            } else if (parts.length === 2) {
                // Already on base domain
                domainPart = hostname;
            }
        }
        
        return `https://${domain}.${domainPart}`;
    };
    
    const storeUrl = getStoreUrl(storeDomain);

    return (
        <div className="space-y-6">
            {/* Plan Status Banner */}
            {userPlan && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${
                        isExpired
                            ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
                            : daysRemaining <= 3
                            ? "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200"
                            : "bg-[var(--brand-blue)]/10 border-[var(--brand-blue)]/30 text-[var(--brand-blue)] dark:bg-[var(--brand-blue)]/20 dark:border-[var(--brand-blue)]/40 dark:text-[var(--brand-blue)]/80"
                    }`}
                >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold">
                                {isExpired
                                    ? t('plan.expired')
                                    : `${t('plan.planLabel')}: ${planKey}`}
                            </p>
                            {userPlan.currentPlan?.endDate && !isExpired && (
                                <p className="text-sm mt-1 opacity-90">
                                    {t('plan.expires')}: {new Date(userPlan.currentPlan.endDate).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                            )}
                            {userPlan.limits && (
                                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                                    {userPlan.limits.maxProducts !== undefined && (
                                        <span>
                                            {t('plan.products')}: {userPlan.usage.products} / {userPlan.limits.maxProducts}
                                        </span>
                                    )}
                                    {userPlan.limits.maxOrders !== undefined && (
                                        <span>
                                            {t('plan.orders')}: {userPlan.usage.orders} / {userPlan.limits.maxOrders}
                                        </span>
                                    )}
                                    {userPlan.limits.maxContacts !== undefined && (
                                        <span>
                                            {t('plan.contacts')}: {userPlan.usage.contacts} / {userPlan.limits.maxContacts}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Visit Store Button - Only show if store plan and store exists */}
                            {isStorePlan && !storeLoading && storeUrl && (
                                <a
                                    href={storeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Visit Store
                                </a>
                            )}
                            {/* Only show upgrade/renew button if not Visionary plan */}
                            {planKey.toLowerCase() !== 'visionary' && (
                                <Link
                                    href="/onboarding/upgrade"
                                    className="px-4 py-2 bg-[var(--brand-blue)] text-white rounded-lg hover:bg-[var(--brand-blue)]/90 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                                >
                                    {isExpired ? t('plan.renewPlan') : t('plan.upgradePlan')}
                                </Link>
                            )}
                            {/* Show renew button if expired, even for Visionary */}
                            {isExpired && planKey.toLowerCase() === 'visionary' && (
                                <Link
                                    href="/onboarding/upgrade"
                                    className="px-4 py-2 bg-[var(--brand-blue)] text-white rounded-lg hover:bg-[var(--brand-blue)]/90 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                                >
                                    {t('plan.renewPlan')}
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Statistics Overview Cards */}
            {statistics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {hasOrders && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">{t('stats.totalRevenue')}</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                                        ${statistics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="p-2 bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-lg flex-shrink-0 ml-2">
                                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--brand-blue)]" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                    
                    {isStorePlan && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">{t('stats.products')}</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                        {statistics.productsCount}
                                    </p>
                                </div>
                                <div className="p-2 bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-lg flex-shrink-0 ml-2">
                                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--brand-blue)]" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {hasOrders && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">{t('stats.orders')}</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                        {statistics.ordersCount}
                                    </p>
                                </div>
                                <div className="p-2 bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-lg flex-shrink-0 ml-2">
                                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--brand-blue)]" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {isWhatsAppPlan && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">{t('stats.templates')}</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                        {templatesCount}
                                    </p>
                                </div>
                                <div className="p-2 bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-lg flex-shrink-0 ml-2">
                                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--brand-blue)]" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Revenue Chart - Only for plans with orders */}
                {hasOrders ? (
                    <RevenueChart orders={orders} />
                ) : (
                    <PlanLockedCard
                        title="Revenue Chart"
                        description="Upgrade to a paid plan to view revenue analytics"
                        feature="orders"
                    />
                )}

                {/* Orders Status Chart - Only for plans with orders */}
                {hasOrders ? (
                    <OrdersStatusChart orders={orders} />
                ) : (
                    <PlanLockedCard
                        title="Orders Status"
                        description="Upgrade to a paid plan to view order analytics"
                        feature="orders"
                    />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Products Chart - Only for store plans */}
                {isStorePlan ? (
                    <TopProductsChart products={products as DashboardProduct[]} />
                ) : (
                    <PlanLockedCard
                        title="Top Products"
                        description="Upgrade to a store plan to view product analytics"
                        feature="store"
                    />
                )}

                {/* Customers Chart - Only for plans with orders or whatsapp */}
                {hasOrders || isWhatsAppPlan ? (
                    <CustomersChart />
                ) : (
                    <PlanLockedCard
                        title="Customers"
                        description="Upgrade to a paid plan to view customer analytics"
                        feature="customers"
                    />
                )}
            </div>

            {/* WhatsApp Templates - Only for WhatsApp plans */}
            {isWhatsAppPlan && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded shadow border border-gray-200 dark:border-gray-700">
                    <h2 className="font-semibold mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        WhatsApp Templates
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        Total templates: {templatesCount}
                    </p>
                </div>
            )}

            {/* Free Plan CTA */}
            {isFreePlan && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-[var(--brand-blue)] to-[#0284c7] text-white p-4 sm:p-6 rounded-xl shadow-lg border border-[var(--brand-blue)]/20"
                >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold mb-2">Unlock Full Features</h3>
                            <p className="text-sm sm:text-base text-white/90">
                                Upgrade your plan to access advanced analytics, store management, WhatsApp automation, and more!
                            </p>
                        </div>
                        <Link
                            href="/onboarding/upgrade"
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-[var(--brand-blue)] rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap text-sm sm:text-base shadow-sm hover:shadow-md"
                        >
                            View Plans
                        </Link>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function PlanLockedCard({
    title,
    description,
    feature,
    compact = false,
}: {
    title: string;
    description: string;
    feature: string;
    compact?: boolean;
}) {
    return (
        <div className={`bg-white dark:bg-gray-800 p-4 rounded shadow border border-gray-200 dark:border-gray-700 ${compact ? "" : "flex flex-col items-center justify-center min-h-[240px]"}`}>
            <div className={`flex flex-col items-center ${compact ? "" : "text-center"}`}>
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-gray-400" />
                </div>
                <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">{title}</h2>
                <p className={`text-gray-600 dark:text-gray-400 ${compact ? "text-sm" : "mb-4"}`}>
                    {description}
                </p>
                <Link
                    href="/onboarding/upgrade"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-blue)] text-white rounded-lg hover:bg-[var(--brand-blue)]/90 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                >
                    <TrendingUp className="w-4 h-4" />
                    Upgrade Plan
                </Link>
            </div>
        </div>
    );
}

