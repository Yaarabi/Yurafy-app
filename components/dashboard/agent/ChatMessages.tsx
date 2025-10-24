'use client';
import { useEffect, useRef } from "react";
import type { Message } from "@/hooks/chat/useStorage"; 

interface Props {
    messages: Message[];
    typing: boolean;
}

export default function ChatMessages({ messages, typing }: Props) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    return (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 rounded-lg bg-white dark:bg-gray-900 shadow-inner flex flex-col gap-2 sm:gap-3 max-h-[70vh] min-h-[60vh]">
        {messages.length === 0 && !typing && (
            <p className="text-gray-400 text-center mt-8 text-sm sm:text-base">
            Start chatting with your AI Agent...
            </p>
        )}

            {messages.map((msg, i) => (
            <div
            key={i}
            className={`max-w-[85%] sm:max-w-[75%] p-2 sm:p-3 rounded-xl break-words text-sm sm:text-base ${
                msg.role === "user"
                ? "bg-[var(--brand-blue)] text-white self-end rounded-br-none"
                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 self-start rounded-bl-none"
            }`}
            >
            {msg.content}
            </div>
        ))}

        {typing && (
            <div className="max-w-[60%] p-2 sm:p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 self-start rounded-bl-none animate-pulse text-sm sm:text-base">
            AI is typing...
            </div>
        )}

        <div ref={messagesEndRef} />
        </div>
    );
}
