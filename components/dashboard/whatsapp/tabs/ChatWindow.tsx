"use client";

import { useState } from "react";
import { IWhatsAppConversation, IWhatsAppMessage } from "@/models/whatsappMessage";

export default function ChatWindow({
    conversation,
    onBack,
    }: {
    conversation: IWhatsAppConversation;
    onBack: () => void;
    }) {
    // Initialize messages directly from the conversation prop
    const [messages, setMessages] = useState<IWhatsAppMessage[]>(conversation.messages || []);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessage: IWhatsAppMessage = {
        from: "me", // optionally replace with user number
        to: conversation.customer.phone,
        type: "text",
        text: input,
        direction: "outgoing",
        status: "sent",
        timestamp: Date.now(),
        };

        // Update backend
        const res = await fetch("/api/whatsapp/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            phone: conversation.customer.phone,
            message: newMessage,
        }),
        });

        if (res.ok) {
        // Optimistically update UI
        setMessages((prev) => [...prev, newMessage]);
        setInput("");
        }
    };

    return (
        <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-600 bg-gray-800">
            <button onClick={onBack} className="md:hidden text-gray-300">
            ← Back
            </button>
            <div className="font-medium text-white">
            {conversation.customer.name || conversation.customer.phone}
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg: IWhatsAppMessage, idx) => {
            const isOutgoing = msg.direction === "outgoing";
            return (
                <div key={msg.waMessageId || idx} className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
                <div
                    className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                    isOutgoing ? "bg-green-600 text-white" : "bg-gray-600 text-white"
                    }`}
                >
                    {msg.text}
                    <div className="text-[10px] text-gray-200 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                </div>
                </div>
            );
            })}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-600 bg-gray-800 flex gap-2">
            <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded"
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
