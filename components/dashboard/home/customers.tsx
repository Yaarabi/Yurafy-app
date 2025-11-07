"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme, useMediaQuery, CircularProgress, Box } from "@mui/material";
import { Users } from "lucide-react";
import { useTranslations } from 'next-intl';

type CustomerStat = {
    customerId: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: { address?: string | null; city?: string | null; country?: string | null } | null;
    totalOrders: number;
    confirmedOrders: number;
    cancelledOrders: number;
    totalSpent: number;
    lastOrderAt?: string | null;
};

export default function CustomersChart({ apiUrl = "/api/customers?page=1&limit=10" }: { apiUrl?: string }) {
    const t = useTranslations('dashboard.stats');
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:768px)");
    const isDark = theme.palette.mode === "dark";
    const [data, setData] = useState<CustomerStat[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [metric, setMetric] = useState<"totalOrders" | "totalSpent">("totalOrders");

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetch(apiUrl)
            .then((r) => r.json())
            .then((json) => {
                if (!mounted) return;
                setData(json.data ?? []);
            })
            .catch((e) => {
                console.error(e);
                if (!mounted) return;
                setData([]);
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, [apiUrl]);

    const topCustomers = useMemo(() => {
        if (!data) return [];
        return [...data]
            .sort((a, b) => {
                const aValue = metric === "totalOrders" ? a.totalOrders : Number(a.totalSpent ?? 0);
                const bValue = metric === "totalOrders" ? b.totalOrders : Number(b.totalSpent ?? 0);
                return bValue - aValue;
            })
            .slice(0, 8); // Top 8 customers
    }, [data, metric]);

    const labels = useMemo(() => {
        return topCustomers.map((c) => {
            const name = c.name || c.email || c.phone || "Guest";
            return isMobile && name.length > 12 ? name.substring(0, 12) + '...' : name;
        });
    }, [topCustomers, isMobile]);

    const values = useMemo(() => {
        return topCustomers.map((c) => 
            metric === "totalOrders" ? c.totalOrders : Number(c.totalSpent ?? 0)
        );
    }, [topCustomers, metric]);

    // Brand blue color
    const brandBlue = isDark ? "#0ea5e9" : "#0ea5e9";

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full">
                <Box className="w-full flex justify-center items-center py-12">
                    <CircularProgress size={40} sx={{ color: brandBlue }} />
                </Box>
            </div>
        );
    }

    const totalValue = values.reduce((sum, val) => sum + val, 0);
    const label = metric === "totalOrders" ? t('topCustomers.byOrders') : t('topCustomers.bySpent');

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-lg">
                        <Users className="w-5 h-5 text-[var(--brand-blue)]" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
                            {t('topCustomers.title')}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {metric === "totalOrders" ? t('topCustomers.subtitle.orders') : t('topCustomers.subtitle.spent')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setMetric("totalOrders")}
                        className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                            metric === "totalOrders"
                                ? "bg-[var(--brand-blue)] text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                        {t('topCustomers.orders')}
                    </button>
                    <button
                        onClick={() => setMetric("totalSpent")}
                        className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                            metric === "totalSpent"
                                ? "bg-[var(--brand-blue)] text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                        {t('topCustomers.spent')}
                    </button>
                </div>
            </div>
            {topCustomers.length > 0 ? (
                <div className="w-full overflow-x-auto">
                    <BarChart
                        xAxis={[{
                            scaleType: "band",
                            data: labels,
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
                            data: values,
                            label: label,
                            color: brandBlue,
                        }]}
                        width={isMobile ? Math.max(320, labels.length * 50) : undefined}
                        height={isMobile ? 280 : 320}
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
                    <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('topCustomers.empty')}
                    </p>
                </div>
            )}
        </div>
    );
}
