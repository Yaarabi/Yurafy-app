"use client";

import { CheckCircle2, XCircle, Truck, Package, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { IOrder } from "@/models/orders";

interface CODMetricsProps {
    orders: IOrder[];
}

export default function CODMetrics({ orders }: CODMetricsProps) {
    // Calculate metrics
    const totalOrders = orders.length;
    
    const confirmedOrders = orders.filter(o => o.status === "confirmed").length;
    const cancelledOrders = orders.filter(o => o.status === "cancelled").length;
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;
    const shippedOrders = orders.filter(o => o.status === "shipped").length;
    const pendingOrders = orders.filter(o => o.status === "new").length;
    
    // Calculate rates
    const confirmationRate = totalOrders > 0 ? (confirmedOrders / totalOrders) * 100 : 0;
    const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
    const deliveryRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
    const shippingRate = totalOrders > 0 ? (shippedOrders / totalOrders) * 100 : 0;
    const pendingRate = totalOrders > 0 ? (pendingOrders / totalOrders) * 100 : 0;
    
    // Calculate average order value
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Success rate (confirmed + delivered + shipped)
    const successfulOrders = confirmedOrders + deliveredOrders + shippedOrders;
    const successRate = totalOrders > 0 ? (successfulOrders / totalOrders) * 100 : 0;

    const metrics = [
        {
            label: "Confirmation Rate",
            value: `${confirmationRate.toFixed(1)}%`,
            count: `${confirmedOrders} / ${totalOrders}`,
            icon: CheckCircle2,
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-50 dark:bg-green-900/20",
            description: "Orders confirmed by customers",
        },
        {
            label: "Cancellation Rate",
            value: `${cancellationRate.toFixed(1)}%`,
            count: `${cancelledOrders} / ${totalOrders}`,
            icon: XCircle,
            color: "text-red-600 dark:text-red-400",
            bgColor: "bg-red-50 dark:bg-red-900/20",
            description: "Orders cancelled",
        },
        {
            label: "Delivery Rate",
            value: `${deliveryRate.toFixed(1)}%`,
            count: `${deliveredOrders} / ${totalOrders}`,
            icon: Truck,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
            description: "Successfully delivered orders",
        },
        {
            label: "Shipping Rate",
            value: `${shippingRate.toFixed(1)}%`,
            count: `${shippedOrders} / ${totalOrders}`,
            icon: Package,
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
            description: "Orders currently in shipping",
        },
        {
            label: "Pending Rate",
            value: `${pendingRate.toFixed(1)}%`,
            count: `${pendingOrders} / ${totalOrders}`,
            icon: Clock,
            color: "text-yellow-600 dark:text-yellow-400",
            bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
            description: "Orders awaiting confirmation",
        },
        {
            label: "Success Rate",
            value: `${successRate.toFixed(1)}%`,
            count: `${successfulOrders} / ${totalOrders}`,
            icon: TrendingUp,
            color: "text-[var(--brand-blue)]",
            bgColor: "bg-[var(--brand-blue)]/10",
            description: "Overall successful orders",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {metrics.map((metric, index) => (
                    <div
                        key={index}
                        className={`${metric.bgColor} p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <metric.icon className={`w-5 h-5 ${metric.color}`} />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {metric.label}
                        </p>
                        <p className={`text-xl sm:text-2xl font-bold ${metric.color}`}>
                            {metric.value}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {metric.count}
                        </p>
                    </div>
                ))}
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[var(--brand-blue)]/10 to-[var(--brand-blue)]/5 dark:from-[var(--brand-blue)]/20 dark:to-[var(--brand-blue)]/10 p-4 rounded-lg border border-[var(--brand-blue)]/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-[var(--brand-blue)]" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Average Order Value</p>
                            <p className="text-2xl font-bold text-[var(--brand-blue)]">
                                ${averageOrderValue.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Total Revenue: ${totalRevenue.toFixed(2)}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Funnel</p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                {pendingOrders} → {confirmedOrders} → {deliveredOrders}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Pending → Confirmed → Delivered
                    </p>
                </div>
            </div>

            {/* Performance Indicator */}
            {successRate < 50 && totalOrders >= 5 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Low Success Rate Detected
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            Your current success rate is {successRate.toFixed(1)}%. Consider reviewing your order confirmation process or delivery workflow.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
