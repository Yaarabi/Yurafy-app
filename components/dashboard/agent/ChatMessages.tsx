'use client';

import { useEffect, useRef } from "react";
import type { Message } from "@/hooks/chat/useStorage"; 
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { useTranslations } from 'next-intl';

interface Props {
    messages: Message[];
    typing: boolean;
}

export default function ChatMessages({ messages, typing }: Props) {
    const t = useTranslations('agent');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 flex flex-col gap-3 sm:gap-4 h-full scroll-smooth">
            
            {messages.length === 0 && !typing && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center px-4"
                >
                    <div className="p-4 bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-2xl mb-4">
                        <Bot className="w-12 h-12 text-[var(--brand-blue)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        {t('messages.startConversation')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                        {t('messages.startDescription')}
                    </p>
                </motion.div>
            )}

            {messages.map((msg, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2 sm:gap-3`}
                >
                    {msg.role === "agent" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--brand-blue)]/20 to-[var(--brand-blue)]/10 dark:from-[var(--brand-blue)]/30 dark:to-[var(--brand-blue)]/20 flex items-center justify-center flex-shrink-0 mb-1">
                            <Bot className="w-4 h-4 text-[var(--brand-blue)]" />
                        </div>
                    )}
                    
                    <div
                        className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl break-words text-sm sm:text-base shadow-sm transition-all duration-200 ${
                            msg.role === "user"
                            ? "bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-blue)]/90 text-white rounded-br-md hover:shadow-md"
                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-md hover:shadow-md"
                        }`}
                    >
                        {msg.role === "agent" ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-100">
                                <ReactMarkdown>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        )}
                    </div>

                    {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--brand-blue)]/20 to-[var(--brand-blue)]/10 dark:from-[var(--brand-blue)]/30 dark:to-[var(--brand-blue)]/20 flex items-center justify-center flex-shrink-0 mb-1">
                            <User className="w-4 h-4 text-[var(--brand-blue)]" />
                        </div>
                    )}
                </motion.div>
            ))}

            {typing && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start items-end gap-2 sm:gap-3"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--brand-blue)]/20 to-[var(--brand-blue)]/10 dark:from-[var(--brand-blue)]/30 dark:to-[var(--brand-blue)]/20 flex items-center justify-center flex-shrink-0 mb-1">
                        <Bot className="w-4 h-4 text-[var(--brand-blue)]" />
                    </div>
                    <div className="max-w-[60%] px-4 py-3 rounded-2xl rounded-bl-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm">
                        <div className="flex gap-1.5 items-center">
                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </motion.div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}
