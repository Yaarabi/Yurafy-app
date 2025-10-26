"use client";

import { LineChart } from "@mui/x-charts/LineChart";
import { useTheme, useMediaQuery } from "@mui/material";
import { IOrder } from "@/models/orders";

interface Props {
    orders: IOrder[];
}

export default function RevenueChart({ orders }: Props) {
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:768px)");

    const revenueByDate: Record<string, number> = {};
    orders.forEach((o) => {
        const date = new Date(o.createdAt).toLocaleDateString();
        revenueByDate[date] = (revenueByDate[date] || 0) + o.totalAmount;
    });

    const labels = Object.keys(revenueByDate);
    const values = Object.values(revenueByDate);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow w-full">
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Revenue Over Time
        </h2>
        <LineChart
            xAxis={[
            {
                scaleType: "point",
                data: labels,
                tickLabelStyle: { fill: theme.palette.mode === "dark" ? "#fff" : "#111" },
            },
            ]}
            series={[
            {
                data: values,
                label: "Revenue (MAD)",
                color: theme.palette.mode === "dark" ? "#60a5fa" : "#2563eb",
            },
            ]}
            width={isMobile ? 280 : 420}
            height={isMobile ? 180 : 240}
            sx={{
            "& .MuiChartsLegend-label": {
                fill: theme.palette.mode === "dark" ? "#fff" : "#111",
            },
            }}
        />
        </div>
    );
}
