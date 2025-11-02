"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Lock, BarChart3, TrendingUp, ShoppingCart, Package, Users } from "lucide-react";
import RevenueChart from "@/components/dashboard/home/RevenueChart";
import OrdersStatusChart from "@/components/dashboard/home/OrdersStatusChart";
import TopProductsChart from "@/components/dashboard/home/TopProductsChart";
import CustomersChart from "@/components/dashboard/home/customers";
import Link from "next/link";

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

interface PlanAwareDashboardProps {
    orders: any[];
    products: any[];
    templatesCount?: number;
    featuresData?: any; // UserFeaturesData from hook
}

export default function PlanAwareDashboard({ orders, products, templatesCount = 0, featuresData }: PlanAwareDashboardProps) {
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
                            : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold">
                                {isExpired
                                    ? "Your plan has expired"
                                    : `Plan: ${planKey}`}
                            </p>
                            {userPlan.currentPlan?.endDate && !isExpired && (
                                <p className="text-sm mt-1 opacity-90">
                                    Expires: {new Date(userPlan.currentPlan.endDate).toLocaleDateString('en-US', { 
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
                                            Products: {userPlan.usage.products} / {userPlan.limits.maxProducts}
                                        </span>
                                    )}
                                    {userPlan.limits.maxOrders !== undefined && (
                                        <span>
                                            Orders: {userPlan.usage.orders} / {userPlan.limits.maxOrders}
                                        </span>
                                    )}
                                    {userPlan.limits.maxContacts !== undefined && (
                                        <span>
                                            Contacts: {userPlan.usage.contacts} / {userPlan.limits.maxContacts}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <Link
                            href="/dashboard/settings?tab=plan"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                            {isExpired ? "Renew Plan" : "Upgrade Plan"}
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* Statistics Overview Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {hasOrders && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ${statistics.totalRevenue.toLocaleString()}
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-green-500" />
                            </div>
                        </motion.div>
                    )}
                    
                    {isStorePlan && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Products</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {statistics.productsCount}
                                    </p>
                                </div>
                                <Package className="w-8 h-8 text-blue-500" />
                            </div>
                        </motion.div>
                    )}

                    {hasOrders && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {statistics.ordersCount}
                                    </p>
                                </div>
                                <ShoppingCart className="w-8 h-8 text-purple-500" />
                            </div>
                        </motion.div>
                    )}

                    {isWhatsAppPlan && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Templates</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {templatesCount}
                                    </p>
                                </div>
                                <BarChart3 className="w-8 h-8 text-indigo-500" />
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Products Chart - Only for store plans */}
                {isStorePlan ? (
                    <TopProductsChart products={products} />
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
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Unlock Full Features</h3>
                            <p className="text-indigo-100">
                                Upgrade your plan to access advanced analytics, store management, WhatsApp automation, and more!
                            </p>
                        </div>
                        <Link
                            href="/onboarding/plan"
                            className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
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
                    href="/dashboard/settings?tab=plan"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                    <TrendingUp className="w-4 h-4" />
                    Upgrade Plan
                </Link>
            </div>
        </div>
    );
}

