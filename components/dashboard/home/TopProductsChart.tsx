"use client";

import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme, useMediaQuery } from "@mui/material";
import { IProduct } from "@/models/products";

interface Props {
    products: IProduct[];
}

export default function TopProductsChart({ products }: Props) {
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:768px)");

    const top = [...products]
        .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
        .slice(0, 5);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow w-full">
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Top Products
        </h2>
        <BarChart
            xAxis={[
            {
                scaleType: "band",
                data: top.map((p) => p.name),
                tickLabelStyle: { fill: theme.palette.mode === "dark" ? "#fff" : "#111" },
            },
            ]}
            series={[
            {
                data: top.map((p) => p.salesCount),
                label: "Sales",
                color: theme.palette.mode === "dark" ? "#d5e2f1ff" : "#2563eb",
            },
            ]}
            width={isMobile ? 300 : 500}
            height={isMobile ? 220 : 260}
            sx={{
            "& .MuiChartsLegend-label": {
                fill: theme.palette.mode === "dark" ? "#fff" : "#111",
            },
            }}
        />
        </div>
    );
}
