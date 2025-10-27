
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useTheme } from "@mui/material/styles";
import { BarChart } from "@mui/x-charts";


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

export default function CustomersChart({ apiUrl = "/api/customers?page=1&limit=50" }: { apiUrl?: string }) {
    const theme = useTheme();
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

    const labels = useMemo(() => {
        if (!data) return [];
        return data.map((c) => c.name ?? c.phone ?? c.customerId ?? "Guest").slice(0, 50);
    }, [data]);

    const values = useMemo(() => {
        if (!data) return [];
        return data.map((c) => (metric === "totalOrders" ? c.totalOrders : Number(c.totalSpent ?? 0))).slice(0, 50);
    }, [data, metric]);

    // transform for MUI X-Charts Bar dataset
    const series = useMemo(
        () => [
        {
            data: values,
            label: metric === "totalOrders" ? "Total Orders" : "Total Spent",
            color: theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.main,
        },
        ],
        [values, metric, theme]
    );

    if (loading)
        return (
        <Box className="w-full flex justify-center items-center p-6">
            <CircularProgress />
        </Box>
        );

    return (
        <Card sx={{ width: "100%", bgcolor: "background.paper" }}>
        <CardHeader
            title="Customers"
            subheader={metric === "totalOrders" ? "Orders per customer" : "Total spent per customer"}
            action={
            <ToggleButtonGroup
                value={metric}
                exclusive
                onChange={(_, v) => v && setMetric(v)}
                size="small"
                aria-label="metric"
            >
                <ToggleButton value="totalOrders" aria-label="orders">
                Orders
                </ToggleButton>
                <ToggleButton value="totalSpent" aria-label="spent">
                Spent
                </ToggleButton>
            </ToggleButtonGroup>
            }
        />
        <CardContent>
            {data && data.length > 0 ? (
            <Box sx={{ width: "100%", height: { xs: 280, sm: 360 }, px: 1 }}>
            <BarChart
            xAxis={[{ scaleType: 'band', data: ['Customer A', 'Customer B', 'Customer C'] }]}
            series={[{ data: [5, 8, 3], label: 'Total Orders' }]}
            width={500}
            height={300}
            />

            </Box>
            ) : (
            <Box className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">No customer data available</Box>
            )}
        </CardContent>
        </Card>
    );
}
