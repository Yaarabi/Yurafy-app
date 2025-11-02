'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, User, Globe, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface StoreData {
    _id: string;
    owner: {
        _id: string;
        username: string;
        email: string;
    } | null;
    brandName: string;
    domain: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function AdminStoresManagement() {
    const [stores, setStores] = useState<StoreData[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/stores');
            if (!res.ok) throw new Error('Failed to fetch stores');
            const data = await res.json();
            setStores(data.stores || []);
        } catch (err) {
            console.error('Error fetching stores:', err);
            toast.error('Failed to load stores');
        } finally {
            setLoading(false);
        }
    };

    const toggleStoreActive = async (storeId: string, currentActive: boolean) => {
        try {
            setUpdating(storeId);
            const res = await fetch('/api/admin/stores', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId, active: !currentActive }),
            });

            if (!res.ok) throw new Error('Failed to update store');
            
            setStores(stores.map(s => 
                s._id === storeId ? { ...s, active: !currentActive } : s
            ));
            toast.success(`Store ${!currentActive ? 'activated' : 'deactivated'} successfully`);
        } catch (err) {
            console.error('Error updating store:', err);
            toast.error('Failed to update store');
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Store className="w-6 h-6 text-indigo-600" />
                        Stores Management
                    </h2>
                    <button
                        onClick={fetchStores}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Refresh
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Store</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Domain</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Owner</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No stores found
                                    </td>
                                </tr>
                            ) : (
                                stores.map((store) => (
                                    <motion.tr
                                        key={store._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {store.brandName}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <Globe className="w-4 h-4" />
                                                {store.domain}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {store.owner ? (
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {store.owner.username}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {store.owner.email}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">No owner</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                store.active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                            }`}>
                                                {store.active ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-3 h-3" />
                                                        Inactive
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => toggleStoreActive(store._id, store.active)}
                                                disabled={updating === store._id}
                                                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                                                    store.active
                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {updating === store._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    store.active ? 'Deactivate' : 'Activate'
                                                )}
                                            </button>
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

