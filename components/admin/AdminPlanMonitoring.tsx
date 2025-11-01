"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    Activity, TrendingUp, TrendingDown, Users, Calendar, 
    CheckCircle, XCircle, Clock, AlertTriangle, BarChart3,
    Shield, Package, Loader2
} from "lucide-react";
import toast from "react-hot-toast";

interface UserPlanData {
    userId: string;
    username: string;
    email: string;
    planKey: string;
    status: "active" | "expired" | "cancelled";
    startDate: string;
    endDate: string;
    daysRemaining: number;
    isExpired: boolean;
    limits: {
        maxProducts?: number;
        maxOrders?: number;
        maxContacts?: number;
    };
    usage: {
        products?: number;
        orders?: number;
        contacts?: number;
    };
}

export default function AdminPlanMonitoring() {
    const [users, setUsers] = useState<UserPlanData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterPlan, setFilterPlan] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expired" | "cancelled">("all");
    const [sortBy, setSortBy] = useState<"plan" | "status" | "daysRemaining">("plan");

    useEffect(() => {
        fetchUserPlans();
    }, []);

    const fetchUserPlans = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/user-plans');
            if (!response.ok) throw new Error('Failed to fetch user plans');
            const data = await response.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Error fetching user plans:', error);
            toast.error('Failed to load plan data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePlan = async (userId: string, updates: any) => {
        try {
            const response = await fetch(`/api/admin/user-plans?userId=${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!response.ok) throw new Error('Failed to update plan');
            
            toast.success('Plan updated successfully');
            fetchUserPlans();
        } catch (error) {
            console.error('Error updating plan:', error);
            toast.error('Failed to update plan');
        }
    };

    // Filter and sort users
    const filteredUsers = users
        .filter(user => {
            const matchesPlan = filterPlan === "all" || user.planKey === filterPlan;
            const matchesStatus = filterStatus === "all" || user.status === filterStatus;
            return matchesPlan && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === "plan") return a.planKey.localeCompare(b.planKey);
            if (sortBy === "status") return a.status.localeCompare(b.status);
            return a.daysRemaining - b.daysRemaining;
        });

    // Calculate statistics
    const stats = {
        total: users.length,
        active: users.filter(u => u.status === "active" && !u.isExpired).length,
        expired: users.filter(u => u.isExpired || u.status === "expired").length,
        nearExpiry: users.filter(u => u.status === "active" && u.daysRemaining <= 7 && u.daysRemaining > 0).length,
    };

    const plans = Array.from(new Set(users.map(u => u.planKey))).sort();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-6 h-6 text-indigo-600" />
                    Plan Monitoring & Limits
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monitor user plans, limits, and usage</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Plans"
                    value={stats.total}
                    icon={Package}
                    color="indigo"
                />
                <StatCard
                    title="Active"
                    value={stats.active}
                    icon={CheckCircle}
                    color="green"
                />
                <StatCard
                    title="Expired"
                    value={stats.expired}
                    icon={XCircle}
                    color="red"
                />
                <StatCard
                    title="Near Expiry (≤7 days)"
                    value={stats.nearExpiry}
                    icon={AlertTriangle}
                    color="yellow"
                />
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan</label>
                        <select
                            value={filterPlan}
                            onChange={(e) => setFilterPlan(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Plans</option>
                            {plans.map(plan => (
                                <option key={plan} value={plan}>{plan}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="plan">Plan</option>
                            <option value="status">Status</option>
                            <option value="daysRemaining">Days Remaining</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Plans Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">User</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Days Remaining</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Usage / Limits</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <motion.tr
                                        key={user.userId}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                                                {user.planKey}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            {user.status === "active" && !user.isExpired ? (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="text-sm">Active</span>
                                                </span>
                                            ) : user.status === "expired" || user.isExpired ? (
                                                <span className="flex items-center gap-1 text-red-600">
                                                    <XCircle className="w-4 h-4" />
                                                    <span className="text-sm">Expired</span>
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-sm">Cancelled</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            {user.isExpired ? (
                                                <span className="text-sm text-red-600 dark:text-red-400 font-medium">Expired</span>
                                            ) : user.daysRemaining <= 7 && user.daysRemaining > 0 ? (
                                                <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                                                    {user.daysRemaining} days
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {user.daysRemaining} days
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="space-y-1 text-xs">
                                                {user.limits.maxProducts !== undefined && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600 dark:text-gray-400 w-16">Products:</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">{user.usage?.products || 0} / {user.limits.maxProducts}</span>
                                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-24">
                                                            <div
                                                                className={`h-2 rounded-full ${
                                                                    (user.usage?.products || 0) / user.limits.maxProducts > 0.9
                                                                        ? 'bg-red-500 dark:bg-red-400'
                                                                        : (user.usage?.products || 0) / user.limits.maxProducts > 0.7
                                                                        ? 'bg-yellow-500 dark:bg-yellow-400'
                                                                        : 'bg-green-500 dark:bg-green-400'
                                                                }`}
                                                                style={{ width: `${Math.min(((user.usage?.products || 0) / user.limits.maxProducts) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                {user.limits.maxOrders !== undefined && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600 dark:text-gray-400 w-16">Orders:</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">{user.usage?.orders || 0} / {user.limits.maxOrders}</span>
                                                    </div>
                                                )}
                                                {user.limits.maxContacts !== undefined && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600 dark:text-gray-400 w-16">Contacts:</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">{user.usage?.contacts || 0} / {user.limits.maxContacts}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ 
    title, 
    value, 
    icon: Icon, 
    color = "indigo" 
}: { 
    title: string; 
    value: number; 
    icon: any;
    color?: string;
}) {
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
                <div className={`p-3 rounded-lg bg-opacity-10 dark:bg-opacity-20`} style={{ backgroundColor: `${iconColors[color] || iconColors.indigo}20` }}>
                    <Icon className="w-6 h-6" style={{ color: iconColors[color] || iconColors.indigo }} />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value.toLocaleString()}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        </motion.div>
    );
}

