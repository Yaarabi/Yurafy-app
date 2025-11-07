'use client';

import { useEffect, useState, useMemo } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { IWhatsAppConversation } from '@/models/whatsappMessage';
import { Filter, X } from 'lucide-react';
import { useUserFeatures } from '@/hooks/useUserFeatures';

export default function LogsTab() {
    const [conversations, setConversations] = useState<IWhatsAppConversation[]>([]);
    const [activeConv, setActiveConv] = useState<IWhatsAppConversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        autoReply: false,
        orderConfirm: false,
        adTemplate: false,
        agentReply: false,
        notRead: false,
    });
    const { data: featuresData } = useUserFeatures();
    const hasAIAgent = featuresData?.planFeatures?.ai?.enabled ?? false;

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

    // Filter conversations based on selected filters
    const filteredConversations = useMemo(() => {
        if (!Object.values(filters).some(v => v)) {
            return conversations;
        }

        return conversations.filter(conv => {
            if (filters.autoReply && !conv.metadata?.autoReplySent) return false;
            if (filters.orderConfirm && !conv.metadata?.orderConfirmationSent) return false;
            if (filters.adTemplate && !conv.metadata?.adTemplateSent) return false;
            if (filters.agentReply && !conv.messages?.some((msg: any) => msg.isAIResponse)) return false;
            if (filters.notRead && conv.metadata?.lastReadStatus === 'read') return false;
            return true;
        });
    }, [conversations, filters]);

    const toggleFilter = (filterName: keyof typeof filters) => {
        setFilters(prev => ({ ...prev, [filterName]: !prev[filterName] }));
    };

    const clearFilters = () => {
        setFilters({
            autoReply: false,
            orderConfirm: false,
            adTemplate: false,
            agentReply: false,
            notRead: false,
        });
    };

    return (
        <div className="flex flex-col h-[85vh] overflow-hidden bg-white dark:bg-gray-700">
        {/* Filters Section */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-3">
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
                </div>
                <button
                    onClick={() => toggleFilter('autoReply')}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        filters.autoReply
                            ? 'bg-[var(--brand-blue)] text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                >
                    Auto Reply
                </button>
                <button
                    onClick={() => toggleFilter('orderConfirm')}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        filters.orderConfirm
                            ? 'bg-[var(--brand-blue)] text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                >
                    Order Confirm
                </button>
                <button
                    onClick={() => toggleFilter('adTemplate')}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        filters.adTemplate
                            ? 'bg-[var(--brand-blue)] text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                >
                    Ad Template
                </button>
                {hasAIAgent && (
                    <button
                        onClick={() => toggleFilter('agentReply')}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                            filters.agentReply
                                ? 'bg-[var(--brand-blue)] text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                    >
                        Agent Reply
                    </button>
                )}
                <button
                    onClick={() => toggleFilter('notRead')}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        filters.notRead
                            ? 'bg-[var(--brand-blue)] text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                >
                    Not Read
                </button>
                {Object.values(filters).some(v => v) && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                        <X className="w-3 h-3" />
                        Clear
                    </button>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {filteredConversations.length} of {conversations.length}
                </span>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div
                className={`w-full md:w-1/3 border-r border-gray-200 dark:border-gray-600 ${
                activeConv ? 'hidden md:block' : 'block'
                }`}
            >
                {loading ? (
                <p className="text-gray-500 dark:text-gray-300 text-center mt-6">Loading...</p>
                ) : (
                <ConversationList conversations={filteredConversations} onSelect={setActiveConv} />
                )}
            </div>

            {/* Chat Window */}
            <div className={`flex-1 ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
                {activeConv ? (
                <ChatWindow
                    key={activeConv._id?.toString()} 
                    conversation={activeConv}
                    onBack={() => setActiveConv(null)}
                />
                ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    Select a conversation
                </div>
                )}
            </div>
        </div>
        </div>
    );
}
