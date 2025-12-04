"use client";

import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme, useMediaQuery } from "@mui/material";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

interface DashboardProduct {
    name: string;
    price: number;
    salesCount: number;
}

interface Props {
    products: DashboardProduct[];
}

export default function TopProductsChart({ products }: Props) {
    const t = useTranslations('dashboard.charts.topProducts');
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:768px)");
    const isDark = theme.palette.mode === "dark";

    const top = [...products]
        .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
        .slice(0, 5);

    // Truncate product names for mobile
    const truncateName = (name: string, maxLength: number = 15): string => {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength) + '...';
    };

    const productNames = top.map((p) => 
        isMobile ? truncateName(p.name || t('unnamedProduct'), 12) : (p.name || t('unnamedProduct'))
    );
    const salesData = top.map((p) => p.salesCount || 0);

    // Brand blue color
    const brandBlue = isDark ? "#0ea5e9" : "#0ea5e9";

    const totalSales = salesData.reduce((sum, val) => sum + val, 0);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-lg">
                        <ShoppingBag className="w-5 h-5 text-[var(--brand-blue)]" />
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
                {totalSales > 0 && (
                    <div className="flex flex-col sm:items-end gap-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('totalSales')}</p>
                        <p className="text-lg sm:text-xl font-bold text-[var(--brand-blue)]">
                            {totalSales.toLocaleString()}
                        </p>
                    </div>
                )}
            </div>
            {top.length > 0 ? (
                <div className="w-full overflow-x-auto">
                    <BarChart
                        xAxis={[{
                            scaleType: "band",
                            data: productNames,
                            tickLabelStyle: { 
                                fill: isDark ? "#9ca3af" : "#6b7280",
                                fontSize: isMobile ? 10 : 12,
                                angle: isMobile ? -45 : 0,
                                textAnchor: isMobile ? 'end' : 'middle',
                            },
                        }]}
                        yAxis={[{
                            tickLabelStyle: { 
                                fill: isDark ? "#9ca3af" : "#6b7280",
                                fontSize: isMobile ? 10 : 12,
                            },
                        }]}
                        series={[{
                            data: salesData,
                            label: t('label'),
                            color: brandBlue,
                        }]}
                        width={isMobile ? Math.max(320, productNames.length * 60) : undefined}
                        height={isMobile ? 260 : 320}
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
                    <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('noData')}
                    </p>
                </div>
            )}
        </div>
    );
}
