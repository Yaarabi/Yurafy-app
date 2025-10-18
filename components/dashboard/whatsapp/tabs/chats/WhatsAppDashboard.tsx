
'use client';

import { useState } from 'react';
import LogsTab from './LogsTab';
import ContactsTab from './ContactsTab';

export default function WhatsAppDashboard() {
    const [activeTab, setActiveTab] = useState<'contacts' | 'logs'>('logs');

    return (
        <div className="flex flex-col h-full w-full bg-gray-800 text-white">
            {/* Tabs */}
            <div className="flex border-b border-gray-600">
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`flex-1 py-2 text-center ${
                        activeTab === 'logs' ? 'bg-gray-700 font-semibold' : ''
                    }`}
                >
                    Conversations
                </button>
                <button
                    onClick={() => setActiveTab('contacts')}
                    className={`flex-1 py-2 text-center ${
                        activeTab === 'contacts' ? 'bg-gray-700 font-semibold' : ''
                    }`}
                >
                    Contacts
                </button>
            </div>

            <div className="flex-1 overflow-hidden">
                {activeTab === 'logs' && <LogsTab />}
                {activeTab === 'contacts' && <ContactsTab />}
            </div>
        </div>
    );
}
