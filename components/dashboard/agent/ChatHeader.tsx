'use client';
import { Trash2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface Props {
    onClear: () => void;
}

export default function ChatHeader({ onClear }: Props) {
    const t = useTranslations('agent');
    
    return (
        <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-[var(--brand-blue)] via-[var(--brand-blue)]/90 to-[var(--brand-blue)]/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 flex-1">
                <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-2 bg-white/20 rounded-xl"
                >
                    <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-white">
                        {t('header.title')}
                    </h1>
                    <p className="text-xs text-white/90 hidden sm:block">
                        {t('header.subtitle')}
                    </p>
                </div>
            </div>
            <motion.button
                onClick={onClear}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all backdrop-blur-sm"
            >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('header.clearChat')}</span>
            </motion.button>
        </div>
    );
}
