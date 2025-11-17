"use client";

import { useState } from "react";
import { Users, Activity } from "lucide-react";
import AdminUserManagement from "./AdminUserManagement";
import AdminPlanMonitoring from "./AdminPlanMonitoring";

export default function AdminUsersPlans({ onRefresh }: { onRefresh: () => void }) {
    const [activeSubTab, setActiveSubTab] = useState<'users' | 'plans'>('users');

    return (
        <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveSubTab('users')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                        activeSubTab === 'users'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                    <Users className="w-4 h-4 inline mr-2" />
                    Users
                </button>
                <button
                    onClick={() => setActiveSubTab('plans')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                        activeSubTab === 'plans'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                    <Activity className="w-4 h-4 inline mr-2" />
                    Plans & Limits
                </button>
            </div>

            {/* Content */}
            <div>
                {activeSubTab === 'users' && <AdminUserManagement onRefresh={onRefresh} />}
                {activeSubTab === 'plans' && <AdminPlanMonitoring />}
            </div>
        </div>
    );
}
