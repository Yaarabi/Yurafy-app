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
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700"
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
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
            >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">{t('header.clearChat')}</span>
            </button>
        </motion.div>
    );
}
