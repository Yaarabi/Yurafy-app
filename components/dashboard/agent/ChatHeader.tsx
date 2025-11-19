'use client';
import { Trash2, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface Props {
    onClear: () => void;
}

export default function ChatHeader({ onClear }: Props) {
    const t = useTranslations('agent');
    
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-lg">
                    <Bot className="w-6 h-6 text-[var(--brand-blue)]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                    {t('header.title')}
                </h2>
            </div>
            <button
                onClick={onClear}
                className="p-2 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
                title={t('header.clearChat')}
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </motion.div>
    );
}
