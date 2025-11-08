"use client";

import { LineChart } from "@mui/x-charts/LineChart";
import { useTheme, useMediaQuery } from "@mui/material";
import { IOrder } from "@/models/orders";
import { TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
    orders: IOrder[];
}

export default function RevenueChart({ orders }: Props) {
    const t = useTranslations('dashboard.charts.revenue');
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:768px)");
    const isDark = theme.palette.mode === "dark";

    // Group revenue by date (last 30 days or all available)
    const revenueByDate: Record<string, number> = {};
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    orders.forEach((o) => {
        const orderDate = new Date(o.createdAt);
        if (orderDate >= thirtyDaysAgo) {
            const dateKey = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + (o.totalAmount || 0);
        }
    });

    // Sort by date
    const sortedEntries = Object.entries(revenueByDate).sort((a, b) => {
        return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });

    const labels = sortedEntries.map(([date]) => date);
    const values = sortedEntries.map(([, amount]) => amount);

    // Calculate total revenue and average
    const totalRevenue = values.reduce((sum, val) => sum + val, 0);
    const averageRevenue = values.length > 0 ? totalRevenue / values.length : 0;

    // Brand blue color
    const brandBlue = isDark ? "#0ea5e9" : "#0ea5e9";
    const brandBlueLight = isDark ? "rgba(14, 165, 233, 0.2)" : "rgba(14, 165, 233, 0.1)";

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-[var(--brand-blue)]" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
                            {t('title')}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {t('subtitle')}
                        </p>
                    </div>
                </div>
                {totalRevenue > 0 && (
                    <div className="flex flex-col sm:items-end gap-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('total')}</p>
                        <p className="text-lg sm:text-xl font-bold text-[var(--brand-blue)]">
                            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                )}
            </div>
            {values.length > 0 ? (
                <div className="w-full overflow-x-auto">
                    <LineChart
                        xAxis={[{
                            scaleType: "point",
                            data: labels,
                            tickLabelStyle: { 
                                fill: isDark ? "#9ca3af" : "#6b7280",
                                fontSize: isMobile ? 10 : 12,
                            },
                        }]}
                        yAxis={[{
                            tickLabelStyle: { 
                                fill: isDark ? "#9ca3af" : "#6b7280",
                                fontSize: isMobile ? 10 : 12,
                            },
                        }]}
                        series={[{
                            data: values,
                            label: t('label'),
                            color: brandBlue,
                            curve: "monotoneX",
                            area: true,
                        }]}
                        width={isMobile ? Math.max(300, labels.length * 40) : undefined}
                        height={isMobile ? 220 : 280}
                        sx={{
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
                    <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('noData')}
                    </p>
                </div>
            )}
        </div>
    );
}
