'use client';

import { useState, useRef, useEffect } from "react";
import { IWhatsAppConversation, IWhatsAppMessage } from "@/models/whatsappMessage";
import { AlertCircle, UserCheck, UserX, Bot, Info } from 'lucide-react';

export default function ChatWindow({
    conversation,
    onBack,
}: {
    conversation: IWhatsAppConversation;
    onBack: () => void;
}) {
    const [messages, setMessages] = useState<IWhatsAppMessage[]>(conversation.messages || []);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
                    <button onClick={onBack} className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 flex-shrink-0">← Back</button>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 dark:text-white truncate">
                            {conversation.customer.name || conversation.customer.phone}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {conversation.status === 'human_required' && (
                                <span className="inline-flex items-center gap-1 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                                    <AlertCircle className="w-3 h-3" />
                                    Human Support Required
                                </span>
                            )}
                            {conversation.optInStatus === 'opted_in' && (
                                <span className="inline-flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                    <UserCheck className="w-3 h-3" />
                                    Opted In
                                </span>
                            )}
                            {conversation.optInStatus === 'opted_out' && (
                                <span className="inline-flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                    <UserX className="w-3 h-3" />
                                    Opted Out
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
                        No messages yet
                    </div>
                ) : (
                    messages.map((msg: IWhatsAppMessage, idx) => {
                        const outgoing = isOutgoing(msg);
                        const isAI = msg.isAIResponse;

                        return (
                            <div key={msg.waMessageId || idx} className={`flex ${outgoing ? "justify-end" : "justify-start"} items-start gap-2`}>
                                {!outgoing && isAI && (
                                    <Bot className="w-4 h-4 text-[var(--brand-blue)] mt-1 flex-shrink-0" />
                                )}
                                <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm relative ${
                                    outgoing 
                                        ? "bg-[var(--brand-blue)] text-white" 
                                        : "bg-white dark:bg-gray-600 text-gray-800 dark:text-white"
                                }`}>
                                    <div className="flex items-center gap-2">
                                        <span>{msg.text}</span>
                                        {isAI && (
                                            <Bot className="w-3 h-3 opacity-70" />
                                        )}
                                    </div>
                                    <div className={`text-[10px] mt-1 ${
                                        outgoing 
                                            ? "text-white/70" 
                                            : "text-gray-500 dark:text-gray-300"
                                    }`}>
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
