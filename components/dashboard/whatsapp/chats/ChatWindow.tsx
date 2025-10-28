'use client';

import { useState, useRef, useEffect } from "react";
import { IWhatsAppConversation, IWhatsAppMessage } from "@/models/whatsappMessage";

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

    return (
        <div className="flex flex-col flex-1 h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex-shrink-0">
                <button onClick={onBack} className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100">← Back</button>
                <div className="font-medium text-gray-800 dark:text-white">{conversation.customer.name || conversation.customer.phone}</div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-700">
                {messages.map((msg: IWhatsAppMessage, idx) => {
                    const isOutgoing = msg.direction === "outgoing";
                    return (
                        <div key={msg.waMessageId || idx} className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${isOutgoing ? "bg-brand-blue text-white" : "bg-white dark:bg-gray-600 text-gray-800 dark:text-white"}`}>
                                {msg.text}
                                <div className="text-[10px] text-gray-500 dark:text-gray-300 mt-1 text-right">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
