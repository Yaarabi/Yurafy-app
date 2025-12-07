'use client';

import { useState, useRef, useEffect } from "react";
import { IWhatsAppConversation, IWhatsAppMessage } from "@/models/whatsappMessage";
import { AlertCircle, UserCheck, UserX, Bot, Info, CheckSquare, Square, Sparkles, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

export default function ChatWindow({
    conversation,
    onBack,
}: {
    conversation: IWhatsAppConversation;
    onBack: () => void;
}) {
    const t = useTranslations('whatsapp');
    
    // Sort messages by timestamp to ensure chronological order
    const sortedMessages = [...(conversation.messages || [])].sort((a, b) => a.timestamp - b.timestamp);
    const [messages, setMessages] = useState<IWhatsAppMessage[]>(sortedMessages);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    
    // Message selection for order extraction
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
    const [extracting, setExtracting] = useState(false);
    const [startDateTime, setStartDateTime] = useState<string>('');
    const [endDateTime, setEndDateTime] = useState<string>('');

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

    // Toggle message selection
    const toggleMessageSelection = (msgId: string) => {
        setSelectedMessages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(msgId)) {
                newSet.delete(msgId);
            } else {
                newSet.add(msgId);
            }
            return newSet;
        });
    };

    // Select all incoming messages
    const selectAllIncoming = () => {
        const incomingMsgIds = messages
            .filter(msg => msg.direction === 'incoming' && msg.text)
            .map(msg => msg.waMessageId || msg.timestamp.toString());
        setSelectedMessages(new Set(incomingMsgIds));
    };

    // Select incoming messages within date/time range
    const selectRange = () => {
        const start = startDateTime ? new Date(startDateTime).getTime() : 0;
        const end = endDateTime ? new Date(endDateTime).getTime() : Date.now();

        const ranged = messages
            .filter(msg => msg.direction === 'incoming' && msg.text)
            .filter(msg => msg.timestamp >= start && msg.timestamp <= end)
            .map(msg => msg.waMessageId || msg.timestamp.toString());

        setSelectedMessages(new Set(ranged));
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedMessages(new Set());
        setSelectionMode(false);
    };

    // Extract orders from selected messages
    const handleExtractOrders = async () => {
        if (selectedMessages.size === 0) {
            toast.error('Please select at least one message');
            return;
        }

        setExtracting(true);
        try {
            const response = await fetch('/api/ai-agent/extract-orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerPhone: conversation.customer.phone,
                    messageIds: Array.from(selectedMessages),
                    startDate: startDateTime || undefined,
                    endDate: endDateTime || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to extract orders');
            }

            toast.success(data.message || 'Order extraction completed!');
            clearSelection();
        } catch (error: any) {
            console.error('Extract orders error:', error);
            toast.error(error.message || 'Failed to extract orders');
        } finally {
            setExtracting(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 h-full">
            {/* Header with Status Info */}
            <div className={`flex flex-col border-b flex-shrink-0 ${
                conversation.status === 'human_required' 
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
            }`}>
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button onClick={onBack} className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 flex-shrink-0">← {t('chat.back')}</button>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 dark:text-white truncate">
                                {conversation.customer.name || conversation.customer.phone}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                {conversation.status === 'human_required' && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                                        <AlertCircle className="w-3 h-3" />
                                        {t('chat.status.humanRequired')}
                                    </span>
                                )}
                                {conversation.optInStatus === 'opted_in' && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                        <UserCheck className="w-3 h-3" />
                                        {t('chat.status.optedIn')}
                                    </span>
                                )}
                                {conversation.optInStatus === 'opted_out' && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                        <UserX className="w-3 h-3" />
                                        {t('chat.status.optedOut')}
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
                    
                    {/* Order Extraction Button */}
                    <button
                        onClick={() => setSelectionMode(!selectionMode)}
                        className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                            selectionMode
                                ? 'bg-[var(--brand-blue)] text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        title="Extract orders from messages"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{selectionMode ? 'Cancel' : 'Extract Orders'}</span>
                    </button>
                </div>

                {/* Selection Actions Bar */}
                {selectionMode && (
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                                <CheckSquare className="w-4 h-4" />
                                <span>{selectedMessages.size} message{selectedMessages.size !== 1 ? 's' : ''} selected</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={selectAllIncoming}
                                    className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={clearSelection}
                                    className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                            <div className="sm:col-span-1">
                                <label className="block text-[11px] text-blue-800 dark:text-blue-200 mb-1">Start (date & time)</label>
                                <input
                                    type="datetime-local"
                                    value={startDateTime}
                                    onChange={(e) => setStartDateTime(e.target.value)}
                                    className="w-full rounded border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 text-xs text-gray-800 dark:text-white px-2 py-1 focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent"
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-[11px] text-blue-800 dark:text-blue-200 mb-1">End (date & time)</label>
                                <input
                                    type="datetime-local"
                                    value={endDateTime}
                                    onChange={(e) => setEndDateTime(e.target.value)}
                                    className="w-full rounded border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 text-xs text-gray-800 dark:text-white px-2 py-1 focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-end gap-2 sm:col-span-2">
                                <button
                                    onClick={selectRange}
                                    className="px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    Select by Range
                                </button>
                                <button
                                    onClick={handleExtractOrders}
                                    disabled={selectedMessages.size === 0 || extracting}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                                        selectedMessages.size === 0 || extracting
                                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue)]/90'
                                    }`}
                                >
                                    {extracting ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>Extract Orders</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-700">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        {t('chat.empty.noMessages')}
                    </div>
                ) : (
                    messages.map((msg: IWhatsAppMessage, idx) => {
                        const outgoing = isOutgoing(msg);
                        const isAI = msg.isAIResponse;
                        const msgId = msg.waMessageId || msg.timestamp.toString();
                        const isSelected = selectedMessages.has(msgId);
                        const canSelect = selectionMode && !outgoing && msg.text;

                        return (
                            <div 
                                key={`${msgId}-${idx}`} 
                                className={`flex ${outgoing ? "justify-end" : "justify-start"} items-start gap-2 mb-2 ${
                                    canSelect ? 'hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg p-1 -m-1 transition-colors' : ''
                                }`}
                                onClick={() => canSelect && toggleMessageSelection(msgId)}
                            >
                                {/* Selection checkbox for incoming messages */}
                                {canSelect && (
                                    <div className="flex-shrink-0 mt-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMessageSelection(msgId);
                                            }}
                                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
                                        >
                                            {isSelected ? (
                                                <CheckSquare className="w-5 h-5 text-[var(--brand-blue)]" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                )}

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
                                        : isSelected
                                            ? "bg-blue-100 dark:bg-blue-900 text-gray-800 dark:text-white rounded-bl-sm border-2 border-[var(--brand-blue)]"
                                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-sm border border-gray-200 dark:border-gray-600"
                                }`}>
                                    <div className="flex items-start gap-2">
                                        <span className="break-words whitespace-pre-wrap">{msg.text || t('chat.empty.noText')}</span>
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
                                            {t('chat.you')}
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

