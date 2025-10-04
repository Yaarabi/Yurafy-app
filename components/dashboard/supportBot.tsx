

'use client';
import {useTranslations} from 'next-intl';
import {useState} from 'react';

export default function SupportBot() {
    const t = useTranslations('support');
    const [messages, setMessages] = useState([{role: 'bot', text: t('welcome')}]);
    const [input, setInput] = useState('');

    async function send() {
        if (!input.trim()) return;
        setMessages(m => [...m, {role: 'user', text: input}]);
        setInput('');
        // Stubbed bot reply
        setTimeout(() => {
        setMessages(m => [...m, {role: 'bot', text: t('stubReply')}]);
        }, 600);
    }

    return (
        <div className="max-w-2xl">
        <div className="border border-gray-800 rounded-lg p-4 h-80 overflow-y-auto bg-gray-900/50">
            {messages.map((m, i) => (
            <div
                key={i}
                className={`mb-3 ${m.role === 'user' ? 'text-right' : 'text-left'}`}
            >
                <span
                className={`inline-block px-3 py-2 rounded-md ${
                    m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-100'
                }`}
                >
                {m.text}
                </span>
            </div>
            ))}
        </div>
        <div className="mt-3 flex gap-2">
            <input
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-100"
            placeholder={t('placeholder')}
            />
            <button onClick={send} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white">
            {t('send')}
            </button>
        </div>
        </div>
    );
}
