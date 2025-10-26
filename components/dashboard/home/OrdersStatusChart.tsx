"use client";

import { PieChart } from "@mui/x-charts/PieChart";
import { useTheme, useMediaQuery } from "@mui/material";
import { IOrder } from "@/models/orders";

interface Props {
    orders: IOrder[];
}

export default function OrdersStatusChart({ orders }: Props) {
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:768px)");

    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    const darkColors = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];
    const lightColors = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed"];

    const data = Object.entries(statusCounts).map(([status, count], i) => ({
        id: i,
        value: count,
        label: status,
        color: theme.palette.mode === "dark" ? darkColors[i % 5] : lightColors[i % 5],
    }));

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow w-full">
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Orders by Status
        </h2>
        <PieChart
            series={[{ data }]}
            width={isMobile ? 280 : 360}
            height={isMobile ? 200 : 240}
            sx={{
            "& .MuiChartsLegend-label": {
                fill: theme.palette.mode === "dark" ? "#fff" : "#111",
            },
            }}
        />
        </div>
    );
}
