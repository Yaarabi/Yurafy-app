"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Users, Search, Edit2, Trash2, Shield, UserCheck, XCircle, 
    CheckCircle, Mail, Calendar, Package, AlertCircle, Loader2,
    MessageSquare, UserCircle, Hash, Zap
} from "lucide-react";
import toast from "react-hot-toast";

interface User {
    id: string;
    username: string;
    email: string;
    role: "user" | "admin";
    active: boolean;
    plan: string;
    createdAt?: string;
    onboardingCompleted?: boolean;
}

interface UserStats {
    whatsappAccounts: number;
    contacts: number;
    messages: number;
    tokensConsumed: number;
}

interface AdminUserManagementProps {
    onRefresh?: () => void;
}

export default function AdminUserManagement({ onRefresh }: AdminUserManagementProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [userStats, setUserStats] = useState<Record<string, UserStats>>({});
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    // No role filter needed since we only show users with role "user"
    const [filterPlan, setFilterPlan] = useState<string>("all");
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
        fetchUserStats();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            setStatsLoading(true);
            const response = await fetch('/api/admin/users/stats');
            if (!response.ok) throw new Error('Failed to fetch user statistics');
            const data = await response.json();
            
            // Convert stats array to object keyed by userId
            const statsMap: Record<string, UserStats> = {};
            if (data.stats && Array.isArray(data.stats)) {
                data.stats.forEach((stat: { userId: string } & UserStats) => {
                    statsMap[stat.userId] = {
                        whatsappAccounts: stat.whatsappAccounts || 0,
                        contacts: stat.contacts || 0,
                        messages: stat.messages || 0,
                        tokensConsumed: stat.tokensConsumed || 0,
                    };
                });
            }
            setUserStats(statsMap);
        } catch (error) {
            console.error('Error fetching user statistics:', error);
            // Don't show error toast, just log it
        } finally {
            setStatsLoading(false);
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setShowEditModal(true);
    };

    const handleSaveEdit = async (updatedUser: Partial<User>) => {
        if (!editingUser) return;

        try {
            const response = await fetch(`/api/users?id=${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) throw new Error('Failed to update user');
            
            toast.success('User updated successfully');
            setShowEditModal(false);
            setEditingUser(null);
            fetchUsers();
            fetchUserStats();
            onRefresh?.();
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingUserId(userId);
            const response = await fetch(`/api/users?id=${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete user');
            
            toast.success('User deleted successfully');
            fetchUsers();
            fetchUserStats();
            onRefresh?.();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        } finally {
            setDeletingUserId(null);
        }
    };

    // Filter users - only show users with role "user" (exclude admin)
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlan = filterPlan === "all" || user.plan === filterPlan;
        return matchesSearch && matchesPlan;
    });

    const plans = Array.from(new Set(users.map(u => u.plan))).sort();

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" />
                        User Management
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage users (only regular users are shown, admin users are excluded)</p>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total: <span className="font-semibold text-gray-900 dark:text-white">{filteredUsers.length}</span> users
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                    </div>

                    {/* Plan Filter */}
                    <select
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="all">All Plans</option>
                        {plans.map(plan => (
                            <option key={plan} value={plan}>{plan}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">User</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="w-4 h-4" />
                                        WhatsApp Accounts
                                    </div>
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    <div className="flex items-center gap-1">
                                        <UserCircle className="w-4 h-4" />
                                        Contacts
                                    </div>
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    <div className="flex items-center gap-1">
                                        <Hash className="w-4 h-4" />
                                        Messages
                                    </div>
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    <div className="flex items-center gap-1">
                                        <Zap className="w-4 h-4" />
                                        Tokens Consumed
                                    </div>
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const stats = userStats[user.id] || {
                                        whatsappAccounts: 0,
                                        contacts: 0,
                                        messages: 0,
                                        tokensConsumed: 0,
                                    };
                                    return (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900 dark:text-white">{user.plan}</span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                {user.active ? (
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span className="text-sm">Active</span>
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-red-600">
                                                        <XCircle className="w-4 h-4" />
                                                        <span className="text-sm">Inactive</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                {statsLoading ? (
                                                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                                        <MessageSquare className="w-4 h-4 text-purple-600" />
                                                        {stats.whatsappAccounts}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                {statsLoading ? (
                                                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                                        <UserCircle className="w-4 h-4 text-blue-600" />
                                                        {stats.contacts}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                {statsLoading ? (
                                                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                                        <Hash className="w-4 h-4 text-green-600" />
                                                        {stats.messages.toLocaleString()}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                {statsLoading ? (
                                                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                                        <Zap className="w-4 h-4 text-yellow-600" />
                                                        {stats.tokensConsumed.toLocaleString()}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded transition-colors"
                                                        title="Edit user"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        disabled={deletingUserId === user.id}
                                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                        title="Delete user"
                                                    >
                                                        {deletingUserId === user.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && editingUser && (
                    <EditUserModal
                        user={editingUser}
                        onClose={() => {
                            setShowEditModal(false);
                            setEditingUser(null);
                        }}
                        onSave={(data) => {
                            handleSaveEdit(data);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function EditUserModal({ 
    user, 
    onClose, 
    onSave 
}: { 
    user: User; 
    onClose: () => void; 
    onSave: (data: Partial<User>) => void;
}) {
    const [mode, setMode] = useState<'update' | 'upgrade'>('update');
    const [formData, setFormData] = useState({
        planKey: user.plan || 'free',
        durationDays: 30,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        active: user.active,
    });
    const [currentPlan, setCurrentPlan] = useState<any>(null);
    const [planTemplates, setPlanTemplates] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState(true);

    useEffect(() => {
        // Fetch available plan templates and current plan
        const fetchData = async () => {
            try {
                // Fetch plan templates
                const plansRes = await fetch('/api/plan');
                if (plansRes.ok) {
                    const plansData = await plansRes.json();
                    const plans = plansData.planTemplates || [];
                    setPlanTemplates(plans.map((p: any) => p.planKey));
                } else {
                    // Fallback to common plans
                    setPlanTemplates(['free', 'Starter', 'WhatsApp Automation', 'AI WhatsApp Agent', 'Pro Seller', 'Visionary']);
                }

                // Fetch user's current plan
                const planRes = await fetch(`/api/users/${user.id}/plan`);
                if (planRes.ok) {
                    const planData = await planRes.json();
                    if (planData.plan) {
                        setCurrentPlan(planData.plan);
                        // Pre-fill form with current plan data
                        const start = new Date(planData.plan.startDate);
                        const end = new Date(planData.plan.endDate);
                        const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                        setFormData({
                            planKey: planData.plan.planKey,
                            durationDays: duration,
                            startDate: start.toISOString().split('T')[0],
                            endDate: end.toISOString().split('T')[0],
                            active: user.active,
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setPlanTemplates(['free', 'Starter', 'WhatsApp Automation', 'AI WhatsApp Agent', 'Pro Seller', 'Visionary']);
            } finally {
                setLoadingPlan(false);
            }
        };
        fetchData();
    }, [user.id, user.active]);

    const handleDurationChange = (days: number) => {
        const start = new Date(formData.startDate);
        const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
        setFormData({
            ...formData,
            durationDays: days,
            endDate: end.toISOString().split('T')[0],
        });
    };

    const handleStartDateChange = (date: string) => {
        const start = new Date(date);
        const end = new Date(start.getTime() + formData.durationDays * 24 * 60 * 60 * 1000);
        setFormData({
            ...formData,
            startDate: date,
            endDate: end.toISOString().split('T')[0],
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Update user's plan via API
            const response = await fetch(`/api/users/${user.id}/plan`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, mode }),
            });
            if (!response.ok) throw new Error('Failed to update plan');
            toast.success(mode === 'update' ? 'Plan updated successfully' : 'Plan upgraded successfully');
            onSave({ active: formData.active });
        } catch (error) {
            console.error('Error updating plan:', error);
            toast.error('Failed to update user plan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit User Plan</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">User: <span className="font-medium text-gray-900 dark:text-white">{user.username}</span> ({user.email})</p>
                    {currentPlan && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-800 dark:text-blue-200">
                            Current: {currentPlan.planKey} (Expires: {new Date(currentPlan.endDate).toLocaleDateString()})
                        </div>
                    )}
                </div>

                {/* Mode Selector */}
                {!loadingPlan && (
                    <div className="mb-4 flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setMode('update')}
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                mode === 'update'
                                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            Update Existing Plan
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('upgrade')}
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                mode === 'upgrade'
                                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            Upgrade/Change Plan
                        </button>
                    </div>
                )}

                {loadingPlan ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Plan Type
                        </label>
                        <select
                            value={formData.planKey}
                            onChange={(e) => setFormData({ ...formData, planKey: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                        >
                            {planTemplates.length > 0 ? (
                                planTemplates.map(plan => (
                                    <option key={plan} value={plan}>{plan}</option>
                                ))
                            ) : (
                                <option value={user.plan}>{user.plan}</option>
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Duration (Days)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="3650"
                            value={formData.durationDays}
                            onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Common: 30 (month), 90 (quarter), 365 (year)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleStartDateChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="active"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            {formData.active ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                            User Account Active
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Plan'
                            )}
                        </button>
                    </div>
                </form>
                )}
            </motion.div>
        </div>
    );
}

