'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, User, Phone, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AccountData {
    _id: string;
    owner: {
        _id: string;
        username: string;
        email: string;
    } | null;
    waNumber: string;
    status: string;
    verified: boolean;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function AdminAccountsManagement() {
    const [accounts, setAccounts] = useState<AccountData[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/accounts');
            if (!res.ok) throw new Error('Failed to fetch accounts');
            const data = await res.json();
            setAccounts(data.accounts || []);
        } catch (err) {
            console.error('Error fetching accounts:', err);
            toast.error('Failed to load accounts');
        } finally {
            setLoading(false);
        }
    };

    const toggleAccountActive = async (accountId: string, currentActive: boolean) => {
        try {
            setUpdating(accountId);
            const res = await fetch('/api/admin/accounts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId, active: !currentActive }),
            });

            if (!res.ok) throw new Error('Failed to update account');
            
            setAccounts(accounts.map(a => 
                a._id === accountId ? { ...a, active: !currentActive } : a
            ));
            toast.success(`Account ${!currentActive ? 'activated' : 'deactivated'} successfully`);
        } catch (err) {
            console.error('Error updating account:', err);
            toast.error('Failed to update account');
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
                        <Building2 className="w-6 h-6 text-indigo-600" />
                        WhatsApp Accounts Management
                    </h2>
                    <button
                        onClick={fetchAccounts}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Refresh
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Owner</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Verified</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Active</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No accounts found
                                    </td>
                                </tr>
                            ) : (
                                accounts.map((account) => (
                                    <motion.tr
                                        key={account._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                                <Phone className="w-4 h-4" />
                                                {account.waNumber}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {account.owner ? (
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {account.owner.username}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {account.owner.email}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">No owner</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                account.status === 'connected'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                            }`}>
                                                {account.status || 'disconnected'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {account.verified ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                                    <XCircle className="w-3 h-3" />
                                                    Not Verified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                account.active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                            }`}>
                                                {account.active ? (
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
                                                onClick={() => toggleAccountActive(account._id, account.active)}
                                                disabled={updating === account._id}
                                                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                                                    account.active
                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {updating === account._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    account.active ? 'Deactivate' : 'Activate'
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

