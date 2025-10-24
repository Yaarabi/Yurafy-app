'use client';

import { IWhatsAppConversation } from '@/models/whatsappMessage';
import { FaUser } from 'react-icons/fa';

export default function ConversationList({
    conversations = [],
    onSelect,
}: {
    conversations: IWhatsAppConversation[];
    onSelect: (conv: IWhatsAppConversation) => void;
}) {
    return (
        <div className="h-full overflow-y-auto bg-white dark:bg-gray-700">
            {conversations.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center mt-6">No conversations yet.</p>
            ) : (
                conversations.map((conv) => {
                    const customer = conv.customer || { phone: 'Unknown' };
                    const displayName = customer.name || customer.phone || 'Unknown';
                    const unread = conv.unreadCount || 0;

                    return (
                        <button
                            key={conv._id}
                            onClick={() => onSelect(conv)}
                            className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-[var(--brand-blue)]/10 transition-colors"
                        >
                            {/* Left: Icon + Name/Last Message */}
                            <div className="flex items-center gap-3 truncate">
                                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-gray-800 dark:text-gray-100 flex-shrink-0">
                                    <FaUser className="text-lg" />
                                </div>
                                <div className="flex flex-col truncate">
                                    <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{displayName}</span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{conv.lastMessage || 'No messages yet'}</span>
                                </div>
                            </div>

                            {/* Right: Timestamp + Unread Badge */}
                            <div className="flex flex-col items-end flex-shrink-0">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    {conv.lastTimestamp ? new Date(conv.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                                {unread > 0 && (
                                    <span className="bg-brand-blue text-white text-xs font-semibold px-2 py-0.5 rounded-full">
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
