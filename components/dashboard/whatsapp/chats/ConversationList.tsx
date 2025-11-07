'use client';

import { IWhatsAppConversation } from '@/models/whatsappMessage';
import { FaUser } from 'react-icons/fa';
import { AlertCircle, UserCheck, UserX, MessageSquare, CheckCircle2, Mail, Megaphone, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ConversationList({
    conversations = [],
    onSelect,
}: {
    conversations: IWhatsAppConversation[];
    onSelect: (conv: IWhatsAppConversation) => void;
}) {
    const t = useTranslations('whatsapp.conversations');
    
    const getStatusBadge = (conv: IWhatsAppConversation) => {
        // Human escalation priority
        if (conv.status === 'human_required') {
            return (
                <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    {t('status.humanNeeded')}
                </span>
            );
        }
        
        // Opt-in status
        if (conv.optInStatus === 'opted_in') {
            return (
                <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    <UserCheck className="w-3 h-3" />
                    {t('status.optedIn')}
                </span>
            );
        }
        
        if (conv.optInStatus === 'opted_out') {
            return (
                <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    <UserX className="w-3 h-3" />
                    {t('status.optedOut')}
                </span>
            );
        }
        
        return null;
    };

    return (
        <div className="h-full overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-6">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm font-medium">{t('empty.title')}</p>
                    <p className="text-xs mt-1 opacity-75">{t('empty.description')}</p>
                </div>
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
                            className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-[var(--brand-blue)]/10 dark:hover:bg-[var(--brand-blue)]/20 transition-colors ${
                                conv.status === 'human_required' ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-white dark:bg-gray-800'
                            }`}
                        >
                            {/* Left: Icon + Name/Last Message */}
                            <div className="flex items-center gap-3 truncate flex-1 min-w-0">
                                <div className={`w-12 h-12 flex items-center justify-center rounded-full text-gray-800 dark:text-gray-100 flex-shrink-0 shadow-sm ${
                                    conv.status === 'human_required' 
                                        ? 'bg-orange-100 dark:bg-orange-900/40 ring-2 ring-orange-300 dark:ring-orange-700' 
                                        : 'bg-gradient-to-br from-[var(--brand-blue)]/20 to-[var(--brand-blue)]/10 dark:from-[var(--brand-blue)]/30 dark:to-[var(--brand-blue)]/20 ring-1 ring-[var(--brand-blue)]/20'
                                }`}>
                                    {conv.status === 'human_required' ? (
                                        <AlertCircle className="text-lg text-orange-600 dark:text-orange-400" />
                                    ) : (
                                        <span className="text-lg font-semibold text-[var(--brand-blue)]">
                                            {(displayName.charAt(0) || 'U').toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col truncate min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900 dark:text-white truncate text-sm">{displayName}</span>
                                        {statusBadge}
                                    </div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1.5">{conv.lastMessage || t('empty.noMessages')}</span>
                                    {/* Contact Tracking Icons */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {conv.metadata?.autoReplySent && (
                                            <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 text-[var(--brand-blue)] dark:text-[var(--brand-blue)]/80" title={t('tracking.autoReply')}>
                                                <MessageSquare className="w-3 h-3" />
                                                <span className="hidden sm:inline">{t('tracking.auto')}</span>
                                            </span>
                                        )}
                                        {conv.metadata?.orderConfirmationSent && (
                                            <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300" title={t('tracking.orderConfirm')}>
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span className="hidden sm:inline">{t('tracking.order')}</span>
                                            </span>
                                        )}
                                        {conv.metadata?.adTemplateSent && (
                                            <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" title={t('tracking.adTemplate')}>
                                                <Megaphone className="w-3 h-3" />
                                                <span className="hidden sm:inline">{t('tracking.ad')}</span>
                                            </span>
                                        )}
                                        {conv.metadata?.lastReadStatus === 'read' && (
                                            <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" title={t('tracking.read')}>
                                                <Eye className="w-3 h-3" />
                                                <span className="hidden sm:inline">{t('tracking.readLabel')}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Timestamp + Unread Badge */}
                            <div className="flex flex-col items-end flex-shrink-0 ml-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                    {conv.lastTimestamp ? new Date(conv.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                                {unread > 0 && (
                                    <span className="bg-[var(--brand-blue)] text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center shadow-sm">
                                        {unread > 99 ? '99+' : unread}
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
