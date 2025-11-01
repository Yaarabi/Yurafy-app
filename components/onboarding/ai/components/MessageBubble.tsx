import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Message } from '../hooks/useAIStoreSetup';

interface MessageBubbleProps {
    message: Message;
    index: number;
}

export default function MessageBubble({ message, index }: MessageBubbleProps) {
    return (
        <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
            {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-indigo-600" />
                </div>
            )}
            <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                }`}
            >
                <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">Y</span>
                </div>
            )}
        </motion.div>
    );
}

