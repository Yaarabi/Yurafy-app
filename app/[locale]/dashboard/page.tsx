"use client";

import DashboardHeader from "@/components/dashboard/home/Header";
import LogoLoader from "@/components/themePreview/loadder";
import PlanAwareDashboard from "@/components/dashboard/PlanAwareDashboard";
import { useUserFeatures } from "@/hooks/useUserFeatures";

export default function DashboardClient() {
    const { data: featuresData, loading, error } = useUserFeatures();

    if (loading) return <LogoLoader/>;
    if (error) {
        return (
            <div className="p-6 space-y-6 mx-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">Error loading dashboard: {error}</p>
                </div>
            </div>
        );
    }

    if (!featuresData) {
        return (
            <div className="p-6 space-y-6 mx-6">
                <p className="text-gray-600 dark:text-gray-400">No data available</p>
            </div>
        );
    }

    // Extract data for charts
    const orders = featuresData.statistics.recentOrders || [];
    const products = featuresData.statistics.topProducts || [];
    const templatesCount = featuresData.statistics.templatesCount || 0;

    return (
        <div className="p-6 space-y-6 mx-6">
            <DashboardHeader/>
            <PlanAwareDashboard 
                orders={orders} 
                products={products} 
                templatesCount={templatesCount}
                featuresData={featuresData}
            />
        </div>
    );
}
