"use client";

import { PieChart } from "@mui/x-charts/PieChart";
import { useTheme, useMediaQuery } from "@mui/material";
import { IOrder } from "@/models/orders";
import { Package } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
    orders: IOrder[];
}

// Status color mapping with brand blue variations
const getStatusColor = (status: string, index: number, isDark: boolean): string => {
    const statusLower = status.toLowerCase();
    
    // Use brand blue for confirmed/completed orders
    if (statusLower.includes('confirm') || statusLower.includes('complete') || statusLower.includes('delivered')) {
        return isDark ? "#0ea5e9" : "#0ea5e9";
    }
    
    // Use brand blue variations for other statuses
    const brandBlueVariations = isDark 
        ? ["#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd", "#e0f2fe"]
        : ["#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e"];
    
    // Status-specific colors
    const statusColors: Record<string, string> = {
        pending: isDark ? "#fbbf24" : "#d97706",
        processing: isDark ? "#60a5fa" : "#2563eb",
        cancelled: isDark ? "#f87171" : "#dc2626",
        refunded: isDark ? "#a78bfa" : "#7c3aed",
    };
    
    return statusColors[statusLower] || brandBlueVariations[index % brandBlueVariations.length];
};

export default function OrdersStatusChart({ orders }: Props) {
    const t = useTranslations('dashboard.charts.ordersStatus');
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:768px)");
    const isDark = theme.palette.mode === "dark";

    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
        const status = o.status || 'Unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Format status labels
    const formatStatusLabel = (status: string): string => {
        return status
            .split(/(?=[A-Z])/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const data = Object.entries(statusCounts)
        .map(([status, count], i) => ({
            id: i,
            value: count,
            label: formatStatusLabel(status),
            color: getStatusColor(status, i, isDark),
        }))
        .sort((a, b) => b.value - a.value); // Sort by count descending

    const totalOrders = orders.length;

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-lg">
                        <Package className="w-5 h-5 text-[var(--brand-blue)]" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
                            {t('title')}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {t('subtitle', { count: totalOrders })}
                        </p>
                    </div>
                </div>
            </div>
            {data.length > 0 ? (
                <div className="w-full overflow-x-auto">
                    <PieChart
                        series={[{
                            data,
                            innerRadius: isMobile ? 30 : 40,
                            outerRadius: isMobile ? 80 : 100,
                            paddingAngle: 2,
                            cornerRadius: 4,
                        }]}
                        width={isMobile ? Math.min(320, window.innerWidth - 32) : 400}
                        height={isMobile ? 280 : 320}
                        sx={{
                            "& .MuiChartsLegend-root": {
                                fontSize: isMobile ? 11 : 12,
                            },
                            "& .MuiChartsLegend-label": {
                                fill: isDark ? "#d1d5db" : "#374151",
                                fontSize: isMobile ? 11 : 12,
                            },
                            "& .MuiChartsTooltip-root": {
                                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                                border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                            },
                        }}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('noData')}
                    </p>
                </div>
            )}
        </div>
    );
}
