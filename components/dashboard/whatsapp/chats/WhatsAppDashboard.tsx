
'use client';

import { useState } from 'react';
import LogsTab from './LogsTab';

export default function WhatsAppDashboard() {
    const [activeTab, setActiveTab] = useState<'contacts' | 'logs'>('logs');

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            <div className="flex-1 overflow-hidden">
                <LogsTab />
            </div>
        </div>
    );
}
