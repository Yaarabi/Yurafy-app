'use client';

import { IWhatsAppConversation } from '@/models/whatsappMessage';
import { FaUser } from 'react-icons/fa';
import { AlertCircle, UserCheck, UserX, MessageSquare } from 'lucide-react';

export default function ConversationList({
    conversations = [],
    onSelect,
}: {
    conversations: IWhatsAppConversation[];
    onSelect: (conv: IWhatsAppConversation) => void;
}) {
    const getStatusBadge = (conv: IWhatsAppConversation) => {
        // Human escalation priority
        if (conv.status === 'human_required') {
            return (
                <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    Human Needed
                </span>
            );
        }
        
        // Opt-in status
        if (conv.optInStatus === 'opted_in') {
            return (
                <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    <UserCheck className="w-3 h-3" />
                    Opted In
                </span>
            );
        }
        
        if (conv.optInStatus === 'opted_out') {
            return (
                <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    <UserX className="w-3 h-3" />
                    Opted Out
                </span>
            );
        }
        
        return null;
    };

    return (
        <div className="h-full overflow-y-auto bg-white dark:bg-gray-700">
            {conversations.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center mt-6">No conversations yet.</p>
            ) : (
                conversations.map((conv) => {
                    const customer = conv.customer || { phone: 'Unknown' };
                    const displayName = customer.name || customer.phone || 'Unknown';
                    const unread = conv.unreadCount || 0;
                    const statusBadge = getStatusBadge(conv);

                    return (
                        <button
                            key={conv._id}
                            onClick={() => onSelect(conv)}
                            className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-[var(--brand-blue)]/10 transition-colors ${
                                conv.status === 'human_required' ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                            }`}
                        >
                            {/* Left: Icon + Name/Last Message */}
                            <div className="flex items-center gap-3 truncate flex-1 min-w-0">
                                <div className={`w-10 h-10 flex items-center justify-center rounded-full text-gray-800 dark:text-gray-100 flex-shrink-0 ${
                                    conv.status === 'human_required' 
                                        ? 'bg-orange-100 dark:bg-orange-900/40' 
                                        : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                    {conv.status === 'human_required' ? (
                                        <AlertCircle className="text-lg text-orange-600 dark:text-orange-400" />
                                    ) : (
                                        <FaUser className="text-lg" />
                                    )}
                                </div>
                                <div className="flex flex-col truncate min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{displayName}</span>
                                        {statusBadge}
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{conv.lastMessage || 'No messages yet'}</span>
                                </div>
                            </div>

                            {/* Right: Timestamp + Unread Badge */}
                            <div className="flex flex-col items-end flex-shrink-0 ml-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    {conv.lastTimestamp ? new Date(conv.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                                {unread > 0 && (
                                    <span className="bg-[var(--brand-blue)] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                        {unread}
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })
            )}
        </div>
    );
}
