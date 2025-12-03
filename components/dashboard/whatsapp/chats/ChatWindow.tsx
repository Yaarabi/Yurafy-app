'use client';

import { useState, useRef, useEffect } from "react";
import { IWhatsAppConversation, IWhatsAppMessage } from "@/models/whatsappMessage";
import { AlertCircle, UserCheck, UserX, Bot, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ChatWindow({
    conversation,
    onBack,
}: {
    conversation: IWhatsAppConversation;
    onBack: () => void;
}) {
    const t = useTranslations('whatsapp.chat');
    
    // Sort messages by timestamp to ensure chronological order
    const sortedMessages = [...(conversation.messages || [])].sort((a, b) => a.timestamp - b.timestamp);
    const [messages, setMessages] = useState<IWhatsAppMessage[]>(sortedMessages);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Update messages when conversation changes
    useEffect(() => {
        const sorted = [...(conversation.messages || [])].sort((a, b) => a.timestamp - b.timestamp);
        setMessages(sorted);
    }, [conversation.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const isOutgoing = (msg: IWhatsAppMessage) => msg.direction === 'outgoing';

    return (
        <div className="flex flex-col flex-1 h-full">
            {/* Header with Status Info */}
            <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${
                conversation.status === 'human_required' 
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
            }`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button onClick={onBack} className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 flex-shrink-0">← {t('back')}</button>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 dark:text-white truncate">
                            {conversation.customer.name || conversation.customer.phone}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {conversation.status === 'human_required' && (
                                <span className="inline-flex items-center gap-1 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                                    <AlertCircle className="w-3 h-3" />
                                    {t('status.humanRequired')}
                                </span>
                            )}
                            {conversation.optInStatus === 'opted_in' && (
                                <span className="inline-flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                    <UserCheck className="w-3 h-3" />
                                    {t('status.optedIn')}
                                </span>
                            )}
                            {conversation.optInStatus === 'opted_out' && (
                                <span className="inline-flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                    <UserX className="w-3 h-3" />
                                    {t('status.optedOut')}
                                </span>
                            )}
                        </div>
                        {conversation.metadata?.escalationReason && (
                            <div className="mt-1 text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                {conversation.metadata.escalationReason}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-700">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        {t('empty.noMessages')}
                    </div>
                ) : (
                    messages.map((msg: IWhatsAppMessage, idx) => {
                        const outgoing = isOutgoing(msg);
                        const isAI = msg.isAIResponse;

                        return (
                            <div 
                                key={`${msg.waMessageId || msg.timestamp}-${idx}`} 
                                className={`flex ${outgoing ? "justify-end" : "justify-start"} items-start gap-2 mb-2`}
                            >
                                {/* Avatar/Icon for incoming messages */}
                                {!outgoing && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                        {isAI ? (
                                            <Bot className="w-4 h-4 text-[var(--brand-blue)]" />
                                        ) : (
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                {(conversation.customer.name || conversation.customer.phone || 'U').charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                )}
                                
                                {/* Message bubble */}
                                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                    outgoing 
                                        ? "bg-[var(--brand-blue)] text-white rounded-br-sm" 
                                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-sm border border-gray-200 dark:border-gray-600"
                                }`}>
                                    <div className="flex items-start gap-2">
                                        <span className="break-words whitespace-pre-wrap">{msg.text || t('empty.noText')}</span>
                                        {outgoing && isAI && (
                                            <Bot className="w-3 h-3 opacity-70 flex-shrink-0 mt-0.5" />
                                        )}
                                    </div>
                                    <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${
                                        outgoing 
                                            ? "text-white/80" 
                                            : "text-gray-500 dark:text-gray-400"
                                    }`}>
                                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {outgoing && (
                                            <span className="ml-1">
                                                {conversation.metadata?.lastReadStatus === 'read' ? '✓✓' : '✓'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Avatar/Icon for outgoing messages */}
                                {outgoing && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--brand-blue)]/20 flex items-center justify-center">
                                        <span className="text-xs font-medium text-[var(--brand-blue)]">
                                            {t('you')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}

