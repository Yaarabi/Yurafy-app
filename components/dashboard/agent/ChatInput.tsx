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
        <div className="p-3 sm:p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-full sm:max-w-[85%] md:max-w-[70%] mx-auto relative">
                <textarea
                    placeholder={t('input.placeholder')}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            onSend();
                        }
                    }}
                    disabled={loading}
                    rows={1}
                    className="w-full px-4 py-3.5 pr-14 rounded-2xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 resize-none border border-gray-200 dark:border-gray-700"
                    style={{ minHeight: '56px', maxHeight: '150px' }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                    }}
                />
                <motion.button
                    onClick={onSend}
                    disabled={loading || !input.trim()}
                    whileHover={!loading && input.trim() ? { scale: 1.05 } : {}}
                    whileTap={!loading && input.trim() ? { scale: 0.95 } : {}}
                    className="absolute right-2 bottom-2 p-2.5 bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg hover:shadow-xl"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </motion.button>
            </div>
        </div>
    );
}
