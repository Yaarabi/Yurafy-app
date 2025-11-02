'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AgentData {
    _id: string;
    owner: {
        _id: string;
        username: string;
        email: string;
    } | null;
    enabled: boolean;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function AdminAgentsManagement() {
    const [agents, setAgents] = useState<AgentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/agents');
            if (!res.ok) throw new Error('Failed to fetch agents');
            const data = await res.json();
            setAgents(data.agents || []);
        } catch (err) {
            console.error('Error fetching agents:', err);
            toast.error('Failed to load agents');
        } finally {
            setLoading(false);
        }
    };

    const toggleAgentActive = async (agentId: string, currentActive: boolean) => {
        try {
            setUpdating(agentId);
            const res = await fetch('/api/admin/agents', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId, active: !currentActive }),
            });

            if (!res.ok) throw new Error('Failed to update agent');
            
            setAgents(agents.map(a => 
                a._id === agentId ? { ...a, active: !currentActive } : a
            ));
            toast.success(`Agent ${!currentActive ? 'activated' : 'deactivated'} successfully`);
        } catch (err) {
            console.error('Error updating agent:', err);
            toast.error('Failed to update agent');
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
                        <Bot className="w-6 h-6 text-indigo-600" />
                        AI Agents Management
                    </h2>
                    <button
                        onClick={fetchAgents}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Refresh
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Owner</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Enabled</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Active</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No agents found
                                    </td>
                                </tr>
                            ) : (
                                agents.map((agent) => (
                                    <motion.tr
                                        key={agent._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                    >
                                        <td className="px-4 py-4">
                                            {agent.owner ? (
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {agent.owner.username}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {agent.owner.email}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">No owner</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                agent.enabled
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                            }`}>
                                                {agent.enabled ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3" />
                                                        Enabled
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-3 h-3" />
                                                        Disabled
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                agent.active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                            }`}>
                                                {agent.active ? (
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
                                                onClick={() => toggleAgentActive(agent._id, agent.active)}
                                                disabled={updating === agent._id}
                                                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                                                    agent.active
                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {updating === agent._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    agent.active ? 'Deactivate' : 'Activate'
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

