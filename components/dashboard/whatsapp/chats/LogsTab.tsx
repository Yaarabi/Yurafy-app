'use client';

import { useEffect, useState } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { IWhatsAppConversation } from '@/models/whatsappMessage';

export default function LogsTab() {
    const [conversations, setConversations] = useState<IWhatsAppConversation[]>([]);
    const [activeConv, setActiveConv] = useState<IWhatsAppConversation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/whatsapp/conversations');
                if (!res.ok) throw new Error('Failed to fetch conversations');
                const data = await res.json();
                setConversations(data.conversations || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    return (
        <div className="flex h-[85vh] overflow-hidden bg-gray-700">
            {/* Sidebar */}
            <div className={`w-full md:w-1/3 border-r border-gray-600 ${activeConv ? 'hidden md:block' : 'block'}`}>
                {loading ? (
                    <p className="text-gray-300 text-center mt-6">Loading...</p>
                ) : (
                    <ConversationList conversations={conversations} onSelect={setActiveConv} />
                )}
            </div>

            {/* Chat Window */}
            <div className={`flex-1 ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
                {activeConv ? (
                    <ChatWindow conversation={activeConv} onBack={() => setActiveConv(null)} />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Select a conversation
                    </div>
                )}
            </div>
        </div>
    );
}
