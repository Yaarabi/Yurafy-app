"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
    Users, Store, ShoppingCart, MessageSquare, TrendingUp, 
    Shield, UserCheck, XCircle, Clock, CheckCircle,
    AlertTriangle, Activity, BarChart3, Settings, Bot,
    Building2
} from "lucide-react";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminPlanMonitoring from "@/components/admin/AdminPlanMonitoring";
import AdminSupportChat from "@/components/admin/AdminSupportChat";
import AdminStoresManagement from "@/components/admin/AdminStoresManagement";
import AdminAccountsManagement from "@/components/admin/AdminAccountsManagement";
import AdminAgentsManagement from "@/components/admin/AdminAgentsManagement";

interface OverviewData {
    counts: {
        users: number;
        stores: number;
        orders: number;
        whatsappAccounts: number;
        supportMessages: number;
    };
    recent: {
        users: any[];
        orders: any[];
    };
}

export default function AdminPage() {
    const { data: session } = useSession();
    const [overview, setOverview] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'plans' | 'stores' | 'accounts' | 'agents' | 'support'>('overview');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOverview();
    }, []);

    const fetchOverview = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/overview');
            if (!response.ok) throw new Error('Failed to fetch overview');
            const data = await response.json();
            setOverview(data);
        } catch (err) {
            console.error('Error fetching overview:', err);
            setError('Failed to load overview data');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ 
        title, 
        value, 
        icon: Icon, 
        color = "indigo",
        trend 
    }: { 
        title: string; 
        value: number | string; 
        icon: any;
        color?: string;
        trend?: string;
    }) => {
        const colorClasses: Record<string, string> = {
            indigo: "bg-indigo-500",
            blue: "bg-blue-500",
            green: "bg-green-500",
            yellow: "bg-yellow-500",
            purple: "bg-purple-500",
            red: "bg-red-500",
        };

        const iconColors: Record<string, string> = {
            indigo: "#6366F1",
            blue: "#3B82F6",
            green: "#10B981",
            yellow: "#F59E0B",
            purple: "#8B5CF6",
            red: "#EF4444",
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-opacity-10 dark:bg-opacity-20" style={{ backgroundColor: `${iconColors[color] || iconColors.indigo}20` }}>
                        <Icon className="w-6 h-6" style={{ color: iconColors[color] || iconColors.indigo }} />
                    </div>
                    {trend && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {trend}
                        </span>
                    )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            </motion.div>
        );
    };

    if (loading && !overview) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40 shadow-sm transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-1 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === 'overview'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <BarChart3 className="w-4 h-4 inline mr-2" />
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === 'users'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Users className="w-4 h-4 inline mr-2" />
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('plans')}
                            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === 'plans'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Activity className="w-4 h-4 inline mr-2" />
                            Plans & Limits
                        </button>
                        <button
                            onClick={() => setActiveTab('stores')}
                            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === 'stores'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Store className="w-4 h-4 inline mr-2" />
                            Stores
                        </button>
                        <button
                            onClick={() => setActiveTab('accounts')}
                            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === 'accounts'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Building2 className="w-4 h-4 inline mr-2" />
                            Accounts
                        </button>
                        <button
                            onClick={() => setActiveTab('agents')}
                            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === 'agents'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Bot className="w-4 h-4 inline mr-2" />
                            Agents
                        </button>
                        <button
                            onClick={() => setActiveTab('support')}
                            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === 'support'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <MessageSquare className="w-4 h-4 inline mr-2" />
                            Support
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 flex items-center gap-2"
                    >
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </motion.div>
                )}

                {activeTab === 'overview' && overview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                            <StatCard title="Total Users" value={overview.counts.users} icon={Users} color="indigo" />
                            <StatCard title="Stores" value={overview.counts.stores} icon={Store} color="blue" />
                            <StatCard title="Orders" value={overview.counts.orders} icon={ShoppingCart} color="green" />
                            <StatCard title="WhatsApp Accounts" value={overview.counts.whatsappAccounts} icon={MessageSquare} color="purple" />
                            <StatCard title="Support Messages" value={overview.counts.supportMessages} icon={MessageSquare} color="yellow" />
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Users */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-indigo-600" />
                                    Recent Users
                                </h3>
                                <div className="space-y-3">
                                    {overview.recent.users.length > 0 ? (
                                        overview.recent.users.map((user: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">No recent users</p>
                                    )}
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5 text-green-600" />
                                    Recent Orders
                                </h3>
                                <div className="space-y-3">
                                    {overview.recent.orders.length > 0 ? (
                                        overview.recent.orders.map((order: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{order.customerName}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">${order.total?.toFixed(2)}</p>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">No recent orders</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'users' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <AdminUserManagement onRefresh={fetchOverview} />
                    </motion.div>
                )}

                {activeTab === 'plans' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <AdminPlanMonitoring />
                    </motion.div>
                )}

                {activeTab === 'stores' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <AdminStoresManagement />
                    </motion.div>
                )}

                {activeTab === 'accounts' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <AdminAccountsManagement />
                    </motion.div>
                )}

                {activeTab === 'agents' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <AdminAgentsManagement />
                    </motion.div>
                )}

                {activeTab === 'support' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <AdminSupportChat />
                    </motion.div>
                )}
            </div>
        </div>
    );
}

