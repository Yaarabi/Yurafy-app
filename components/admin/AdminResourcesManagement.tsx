"use client";

import { useState } from "react";
import { Store, Building2, Bot } from "lucide-react";
import AdminStoresManagement from "./AdminStoresManagement";
import AdminAccountsManagement from "./AdminAccountsManagement";
import AdminAgentsManagement from "./AdminAgentsManagement";

export default function AdminResourcesManagement() {
    const [resourceType, setResourceType] = useState<'stores' | 'whatsapp' | 'agents'>('stores');

    return (
        <div className="space-y-6">
            {/* Resource Type Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Resource Type
                </label>
                <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                    <option value="stores">Stores</option>
                    <option value="whatsapp">WhatsApp Accounts</option>
                    <option value="agents">AI Agents</option>
                </select>
            </div>

            {/* Resource Content */}
            <div>
                {resourceType === 'stores' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Store className="w-6 h-6 text-indigo-600" />
                            Stores Management
                        </h2>
                        <AdminStoresManagement />
                    </div>
                )}
                {resourceType === 'whatsapp' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-indigo-600" />
                            WhatsApp Accounts
                        </h2>
                        <AdminAccountsManagement />
                    </div>
                )}
                {resourceType === 'agents' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Bot className="w-6 h-6 text-indigo-600" />
                            AI Agents
                        </h2>
                        <AdminAgentsManagement />
                    </div>
                )}
            </div>
        </div>
    );
}
