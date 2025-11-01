"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import RevenueChart from "@/components/dashboard/home/RevenueChart";
import OrdersStatusChart from "@/components/dashboard/home/OrdersStatusChart";
import TopProductsChart from "@/components/dashboard/home/TopProductsChart";
import DashboardHeader from "@/components/dashboard/home/Header";
import CustomersChart from "@/components/dashboard/home/customers";
import LogoLoader from "@/components/themePreview/loadder";
import PlanAwareDashboard from "@/components/dashboard/PlanAwareDashboard";

export default function DashboardClient() {
    const { data: session } = useSession();
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

    if (loading) return <LogoLoader/>

    return (
        <div className="p-6 space-y-6 mx-6">
        <DashboardHeader/>

        <PlanAwareDashboard orders={orders} products={products} templates={templates} />
        </div>
    );
}
