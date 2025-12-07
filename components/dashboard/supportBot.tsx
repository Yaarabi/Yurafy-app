'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';

interface IMessage {
    _id?: string;
    role: 'user' | 'bot';
    text: string;
}

export default function SupportBot() {
    const t = useTranslations('supportBot');
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [input, setInput] = useState('');
    const chatRef = useRef<HTMLDivElement>(null);

    // Load messages
    useEffect(() => {
        async function loadMessages() {
        try {
            const res = await fetch(`/api/support`);
            const data = await res.json();
            setMessages(data);
        } catch (err) {
            console.error(err);
        }
        }
        loadMessages();
    }, []);

    // Scroll to bottom
    useEffect(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    async function send() {
        if (!input.trim()) return;

        const newMsg: IMessage = { role: 'user', text: input };
        setMessages((prev) => [...prev, newMsg]);
        setInput('');

        try {
        await fetch('/api/support', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'user', text: input }),
        });

        // Stubbed bot reply
        const botReply: IMessage = { role: 'bot', text: t('stubReply') };
        setTimeout(async () => {
            setMessages((prev) => [...prev, botReply]);
            await fetch('/api/support', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'bot', text: botReply.text }),
            });
        }, 600);
        } catch (err) {
        console.error(err);
        }
    }

    return (
        <div className="flex flex-col h-[70vh] max-h-[600px] w-full">
        {/* Chat Window */}
        <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 border border-gray-200 dark:border-gray-800 rounded-t-lg bg-white dark:bg-gray-900"
        >
            {messages.map((m, i) => (
            <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                <span
                className={`inline-block px-3 py-2 rounded-lg max-w-[75%] break-words ${
                    m.role === 'user'
                    ? 'bg-[var(--brand-blue)] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'
                }`}
                >
                {m.text}
                </span>
            </div>
            ))}
        </div>

        {/* Input + Send */}
        <div className="flex gap-2 p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
            <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={t('placeholder')}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] placeholder-gray-400 dark:placeholder-gray-400"
            />
            <button
            onClick={send}
            className="px-4 py-2 rounded-lg bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 text-white font-medium transition"
            >
            {t('send')}
            </button>
        </div>
        </div>
    );
}
