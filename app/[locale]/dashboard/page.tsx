"use client";

import { useEffect, useState } from "react";
import RevenueChart from "@/components/dashboard/home/RevenueChart";
import OrdersStatusChart from "@/components/dashboard/home/OrdersStatusChart";
import TopProductsChart from "@/components/dashboard/home/TopProductsChart";

export default function DashboardClient() {
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
        try {
            const [ordersRes, productsRes, templatesRes] = await Promise.all([
            fetch("/api/orders"),
            fetch("/api/products"),
            fetch("/api/whatsapp/templates"),
            ]);

            const ordersData = await ordersRes.json();
            const productsData = await productsRes.json();
            const templatesData = await templatesRes.json();

            setOrders(ordersData.orders || []);
            setProducts(productsData.products || []);
            setTemplates(templatesData.templates || []);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
        }
        fetchData();
    }, []);

    if (loading) return <div className="p-6">Loading dashboard...</div>;

    return (
        <div className="p-6 space-y-6 mx-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RevenueChart orders={orders} />
            <OrdersStatusChart orders={orders} />
        </div>

        <TopProductsChart products={products} />

        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h2 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
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
        </div>
        </div>
    );
}
