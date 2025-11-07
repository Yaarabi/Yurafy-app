"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Bot, User, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';

interface SupportMessage {
    _id?: string;
    role: "user" | "bot";
    text: string;
    createdAt?: string;
}

export default function SupportChat() {
    const t = useTranslations('Support.chat');
    const { data: session } = useSession();
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/support");
            if (!response.ok) throw new Error("Failed to fetch messages");
            
            const data = await response.json();
            setMessages(data || []);
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error(t('messages.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || sending) return;

        const userMessage: SupportMessage = {
            role: "user",
            text: input.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setSending(true);

        try {
            const response = await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: "user",
                    text: userMessage.text,
                }),
            });

            if (!response.ok) throw new Error("Failed to send message");

            // Notification for admin is now handled server-side in /api/support
            // Users should NOT receive notifications for their own messages

            toast.success(t('messages.sent'));
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(t('messages.sendError'));
            // Remove the optimistic message on error
            setMessages((prev) => prev.slice(0, -1));
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-[var(--brand-blue)] via-[var(--brand-blue)]/90 to-[var(--brand-blue)]/80 text-white backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </motion.div>
                        <div>
                            <h3 className="font-bold text-lg">{t('title')}</h3>
                            <p className="text-xs text-white/90">{t('subtitle')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={chatRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 scroll-smooth"
            >
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <Loader2 className="w-8 h-8 text-[var(--brand-blue)]" />
                        </motion.div>
                    </div>
                ) : messages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-16 text-center px-4"
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="p-4 bg-gradient-to-br from-[var(--brand-blue)]/20 to-[var(--brand-blue)]/10 dark:from-[var(--brand-blue)]/30 dark:to-[var(--brand-blue)]/20 rounded-2xl mb-4"
                        >
                            <MessageSquare className="w-16 h-16 text-[var(--brand-blue)]" />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            {t('empty.title')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                            {t('empty.description')}
                        </p>
                    </motion.div>
                ) : (
                    messages.map((message, index) => (
                        <motion.div
                            key={message._id || index}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} items-end gap-2 sm:gap-3`}
                        >
                            {message.role === "bot" && (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--brand-blue)]/20 to-[var(--brand-blue)]/10 dark:from-[var(--brand-blue)]/30 dark:to-[var(--brand-blue)]/20 flex items-center justify-center flex-shrink-0 mb-1 border-2 border-white dark:border-gray-800 shadow-sm">
                                    <Bot className="w-5 h-5 text-[var(--brand-blue)]" />
                                </div>
                            )}
                            
                            <div
                                className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl break-words text-sm sm:text-base shadow-sm transition-all duration-200 hover:shadow-md ${
                                    message.role === "user"
                                        ? "bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-blue)]/90 text-white rounded-br-md"
                                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                                }`}
                            >
                                <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                {message.createdAt && (
                                    <p className={`text-xs mt-2 ${
                                        message.role === "user"
                                            ? "text-white/80"
                                            : "text-gray-500 dark:text-gray-400"
                                    }`}>
                                        {new Date(message.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                )}
                            </div>

                            {message.role === "user" && (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--brand-blue)]/20 to-[var(--brand-blue)]/10 dark:from-[var(--brand-blue)]/30 dark:to-[var(--brand-blue)]/20 flex items-center justify-center flex-shrink-0 mb-1 border-2 border-white dark:border-gray-800 shadow-sm">
                                    <User className="w-5 h-5 text-[var(--brand-blue)]" />
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* Input */}
            <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 backdrop-blur-sm">
                <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                        placeholder={t('input.placeholder')}
                        disabled={sending}
                        className="w-full px-4 py-3.5 pr-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:bg-white dark:focus:bg-gray-700 text-sm sm:text-base border border-gray-200 dark:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                    />
                    {input.trim() && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            <MessageSquare className="w-4 h-4 text-[var(--brand-blue)]" />
                        </motion.div>
                    )}
                </div>
                <motion.button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    whileHover={!sending && input.trim() ? { scale: 1.05 } : {}}
                    whileTap={!sending && input.trim() ? { scale: 0.95 } : {}}
                    className="px-5 sm:px-7 py-3.5 bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-blue)]/90 hover:from-[var(--brand-blue)]/90 hover:to-[var(--brand-blue)]/80 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl border border-[var(--brand-blue)]/20"
                >
                    {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            <span className="hidden sm:inline font-semibold">{t('input.send')}</span>
                        </>
                    )}
                </motion.button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 ml-1">
                {t('input.hint')}
            </p>
            </div>
        </div>
    );
}

