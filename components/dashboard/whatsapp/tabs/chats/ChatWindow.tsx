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

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessage: IWhatsAppMessage = {
            from: "me",
            to: conversation.customer.phone,
            type: "text",
            text: input,
            direction: "outgoing",
            status: "sent",
            timestamp: Date.now(),
        };

        const res = await fetch("/api/whatsapp/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone: conversation.customer.phone,
                message: newMessage,
            }),
        });

        if (res.ok) {
            setMessages((prev) => [...prev, newMessage]);
            setInput("");
            scrollToBottom();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col flex-1 h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-600 bg-gray-800 flex-shrink-0">
                <button onClick={onBack} className="md:hidden text-gray-300">← Back</button>
                <div className="font-medium text-white">{conversation.customer.name || conversation.customer.phone}</div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-700">
                {messages.map((msg: IWhatsAppMessage, idx) => {
                    const isOutgoing = msg.direction === "outgoing";
                    return (
                        <div key={msg.waMessageId || idx} className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${isOutgoing ? "bg-green-600 text-white" : "bg-gray-600 text-white"}`}>
                                {msg.text}
                                <div className="text-[10px] text-gray-200 mt-1 text-right">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-600 bg-gray-800 flex gap-2 flex-shrink-0">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none"
                />
                <button
                    onClick={sendMessage}
                    className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
