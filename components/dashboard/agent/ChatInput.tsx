'use client';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface Props {
    input: string;
    setInput: (val: string) => void;
    loading: boolean;
    onSend: () => void;
}

export default function ChatInput({ input, setInput, loading, onSend }: Props) {
    const t = useTranslations('agent');
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 backdrop-blur-sm">
            <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder={t('input.placeholder')}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        className="w-full px-4 py-3.5 pr-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:bg-white dark:focus:bg-gray-700 text-sm sm:text-base border border-gray-200 dark:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                    />
                    {input.trim() && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            <Sparkles className="w-4 h-4 text-[var(--brand-blue)]" />
                        </motion.div>
                    )}
                </div>
                <motion.button
                    onClick={onSend}
                    disabled={loading || !input.trim()}
                    whileHover={!loading && input.trim() ? { scale: 1.05 } : {}}
                    whileTap={!loading && input.trim() ? { scale: 0.95 } : {}}
                    className="px-5 sm:px-7 py-3.5 bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-blue)]/90 rounded-xl hover:from-[var(--brand-blue)]/90 hover:to-[var(--brand-blue)]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg hover:shadow-xl flex items-center justify-center gap-2 border border-[var(--brand-blue)]/20 font-medium"
                >
                    {loading ? (
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
    );
}
