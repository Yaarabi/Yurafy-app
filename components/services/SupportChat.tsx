"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";

type Message = { _id?: string; role: "user" | "bot"; text: string };

export default function SupportChat() {
    const t = useTranslations("Support");
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const LOCAL_STORAGE_KEY = "support_services_messages";

    // Load messages from localStorage
    useEffect(() => {
        if (!open) return;
        try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        setMessages(raw ? JSON.parse(raw) : []);
        } catch {
        setMessages([]);
        }
    }, [open]);

    // Persist messages to localStorage
    useEffect(() => {
        try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
        } catch {}
    }, [messages]);

    // Scroll to bottom
    useLayoutEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Focus input when chat opens
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 120);
    }, [open]);

    // Close chat if clicked outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
        if (
            open &&
            panelRef.current &&
            !panelRef.current.contains(e.target as Node) &&
            !(e.target as HTMLElement).closest("button[aria-label='Open support chat']")
        ) {
            setOpen(false);
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    async function send() {
        const text = input.trim();
        if (!text) return;

        setInput("");
        const userMsg: Message = { role: "user", text };
        setMessages((prev) => [...prev, userMsg]);

        try {
        setLoading(true);

        // Add bot typing placeholder
        setMessages((prev) => {
            const placeholder: Message = { role: "bot", text: "" };
            const newMessages = [...prev, placeholder];
            try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newMessages)); } catch {}
            return newMessages;
        });

        // Fetch AI reply
        const resp = await fetch("/api/support/ai-reply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });

        let botText = "Sorry, no reply.";
        if (resp.ok) {
            const json = await resp.json();
            botText = json?.bot?.text || json?.reply || botText;
        }

        // Replace bot placeholder with actual reply
        setMessages((prev) => {
            const copy = [...prev];
            const botMsg: Message = { role: "bot", text: botText };
            const lastBotIdx = copy.map((m) => m.role).lastIndexOf("bot");
            if (lastBotIdx >= 0) copy[lastBotIdx] = botMsg;
            else copy.push(botMsg);
            try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(copy)); } catch {}
            return copy;
        });
        } catch (err) {
        console.error(err);
        } finally {
        setLoading(false);
        }
    }

    return (
        <div>
        {/* Toggle Button */}
        <button
            aria-label={open ? "Close support chat" : "Open support chat"}
            aria-expanded={open}
            aria-controls="support-chat-panel"
            onClick={() => setOpen((o) => !o)}
            className="fixed right-4 bottom-4 z-[99999] bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 sm:p-3 shadow-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
            {open ? "✕" : "💬"}
        </button>

        {/* Chat Panel */}
        {open && (
            <div
            ref={panelRef}
            id="support-chat-panel"
            role="dialog"
            aria-label={t("chat.title") || "Support Chat"}
            className="fixed z-[99999] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-t-lg sm:rounded-lg shadow-lg flex flex-col p-3
                inset-x-0 bottom-0 sm:inset-auto sm:right-4 sm:bottom-16 sm:w-80 md:w-96 w-full max-h-[70vh] sm:max-h-[60vh]"
            >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-lg">{t("chat.title") || "Support Chat"}</div>
                <button
                aria-label="Close chat"
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 ml-2 p-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                ✕
                </button>
            </div>

            {/* Messages Area */}
            <div
                className="flex-1 mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-auto flex flex-col gap-2"
                style={{ minHeight: "40vh", maxHeight: "70vh" }}
            >
                {messages.map((m, i) => {
                const isTyping = m.role === "bot" && m.text === "" && loading;
                return (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                        className={`inline-block px-3 py-2 rounded-md max-w-[75%] break-words ${
                        m.role === "user"
                            ? "bg-indigo-100 text-indigo-900"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        }`}
                    >
                        {isTyping ? (
                        <div className="flex space-x-1">
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce animation-delay-200"></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce animation-delay-400"></span>
                        </div>
                        ) : (
                        m.text
                        )}
                    </div>
                    </div>
                );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex gap-2 items-center">
                <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-3 py-3 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={t("chat.input.placeholder") || "Type your message..."}
                onKeyDown={(e) => e.key === "Enter" && send()}
                aria-label={t("chat.input.placeholder") || "Type your message"}
                />
                <button
                onClick={send}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition disabled:opacity-50"
                >
                {loading ? "..." : t("chat.input.send") || "Send"}
                </button>
            </div>
            </div>
        )}
        </div>
    );
}
