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
    templates: any[];
}

export default function PlanAwareDashboard({ orders, products, templates }: PlanAwareDashboardProps) {
    const { data: session } = useSession();
    const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserPlan();
    }, [session]);

    const fetchUserPlan = async () => {
        if (!session?.user?.id) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/user/plan");
            if (response.ok) {
                const data = await response.json();
                setUserPlan(data);
            }
        } catch (error) {
            console.error("Error fetching user plan:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const planKey = userPlan?.planKey || "free";
    const isFreePlan = planKey === "free";
    const isStorePlan = planKey === "Starter" || planKey === "Pro Seller" || planKey === "Visionary";
    const isWhatsAppPlan = planKey === "WhatsApp Automation" || planKey === "AI WhatsApp Agent" || planKey === "Pro Seller" || planKey === "Visionary";
    const hasOrders = planKey !== "free";

    return (
        <div className="space-y-6">
            {/* Plan Status Banner */}
            {userPlan && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${
                        userPlan.isExpired
                            ? "bg-red-50 border-red-200 text-red-800"
                            : userPlan.daysRemaining <= 7
                            ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                            : "bg-blue-50 border-blue-200 text-blue-800"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold">
                                {userPlan.isExpired
                                    ? "Your plan has expired"
                                    : `Plan: ${planKey} (${userPlan.daysRemaining} days remaining)`}
                            </p>
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
                            {userPlan.isExpired ? "Renew Plan" : "Upgrade Plan"}
                        </Link>
                    </div>
                </motion.div>
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
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                {isWhatsAppPlan ? (
                    <>
                        <h2 className="font-semibold mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            WhatsApp Templates
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            Total templates: {templates.length}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Approved: {templates.filter((t) => t.status === "APPROVED").length}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Pending: {templates.filter((t) => t.status === "PENDING").length}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Rejected: {templates.filter((t) => t.status === "REJECTED").length}
                        </p>
                    </>
                ) : (
                    <PlanLockedCard
                        title="WhatsApp Templates"
                        description="Upgrade to a WhatsApp plan to manage templates"
                        feature="whatsapp"
                        compact
                    />
                )}
            </div>

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

