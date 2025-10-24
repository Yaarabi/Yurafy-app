'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function SupportBot() {
    const t = useTranslations('support');
    const [messages, setMessages] = useState([{ role: 'bot', text: t('welcome') }]);
    const [input, setInput] = useState('');

    async function send() {
        if (!input.trim()) return;
        setMessages((m) => [...m, { role: 'user', text: input }]);
        setInput('');
        // Stubbed bot reply
        setTimeout(() => {
        setMessages((m) => [...m, { role: 'bot', text: t('stubReply') }]);
        }, 600);
    }

    return (
        <div className="max-w-2xl">
        {/* Chat window */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-80 overflow-y-auto bg-white dark:bg-gray-900 space-y-3">
            {messages.map((m, i) => (
            <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                <span
                className={`inline-block px-3 py-2 rounded-md max-w-[75%] break-words
                    ${
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
        <div className="mt-3 flex gap-2">
            <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md 
                        bg-gray-50 dark:bg-gray-800 
                        border border-gray-200 dark:border-gray-700 
                        text-gray-800 dark:text-gray-100
                        focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]"
            placeholder={t('placeholder')}
            />
            <button
            onClick={send}
            className="px-4 py-2 rounded-md 
                        bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 
                        text-white font-medium transition"
            >
            {t('send')}
            </button>
        </div>
        </div>
    );
}
