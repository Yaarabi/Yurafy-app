"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Users, Search, Edit2, Trash2, Shield, UserCheck, XCircle, 
    CheckCircle, Mail, Calendar, Package, AlertCircle, Loader2
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

interface AdminUserManagementProps {
    onRefresh?: () => void;
}

export default function AdminUserManagement({ onRefresh }: AdminUserManagementProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    // No role filter needed since we only show users with role "user"
    const [filterPlan, setFilterPlan] = useState<string>("all");
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
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
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
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
                                ))
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
    const [formData, setFormData] = useState({
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 transition-colors duration-200"
            >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit User</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="active"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

