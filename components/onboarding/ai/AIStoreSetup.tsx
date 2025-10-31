'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AISuggestions {
    brandName?: string;
    domain?: string;
    description?: string;
    category?: string;
    targetAudience?: string;
    socialMedia?: string[];
    theme?: string;
}

export default function AIStoreSetup({ 
    plan, 
    onComplete 
}: { 
    plan: string; 
    onComplete: (storeData: any) => void;
}) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: `Hello! I'm your AI store setup assistant. I'll help you create your online store step by step. Let's start! What kind of business are you running? Tell me about your brand, products, or services.`
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [threadId, setThreadId] = useState<string | null>(null);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/onboarding/ai-setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input.trim(),
                    plan,
                    threadId: threadId || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Save thread ID for conversation continuity
                if (data.threadId && !threadId) {
                    setThreadId(data.threadId);
                }

                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.message || 'I understand! Let me help you set up your store.',
                };
                setMessages(prev => [...prev, assistantMessage]);

                // Check if the agent used the save_store tool (store was created)
                if (data.message && data.message.includes('✅ Store') && data.message.includes('has been created successfully')) {
                    toast.success('Store created successfully!');
                    // Notify parent component
                    setTimeout(() => {
                        if (onComplete) {
                            onComplete({ success: true, message: data.message });
                        }
                    }, 1500);
                }
            } else {
                toast.error(data.error || 'Failed to get AI response');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptSuggestions = () => {
        if (!suggestions) return;

        // Send a confirmation message to the agent to trigger save_store tool
        const confirmationMessage = "Yes, please create the store with these details.";
        setInput(confirmationMessage);
        handleSend();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">AI Store Setup Assistant</h2>
                </div>
                <p className="text-indigo-100">
                    Tell me about your business and I'll help you set up your store automatically!
                </p>
            </div>

            {/* Chat Messages */}
            <div className="bg-white rounded-xl shadow-lg p-6 h-96 overflow-y-auto space-y-4">
                <AnimatePresence>
                    {messages.map((message, index) => (
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
                    ))}
                </AnimatePresence>

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-indigo-600 animate-pulse" />
                        </div>
                        <div className="bg-gray-100 rounded-2xl px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Suggestions */}
            <AnimatePresence>
                {showSuggestions && suggestions && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-200"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <h3 className="text-xl font-semibold text-gray-900">AI Store Suggestions</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {suggestions.brandName && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Brand Name</label>
                                    <p className="text-gray-900 font-semibold">{suggestions.brandName}</p>
                                </div>
                            )}
                            {suggestions.domain && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Domain</label>
                                    <p className="text-gray-900 font-semibold">{suggestions.domain}</p>
                                </div>
                            )}
                            {suggestions.description && (
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Description</label>
                                    <p className="text-gray-900">{suggestions.description}</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleAcceptSuggestions}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                        >
                            Accept & Create Store
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input */}
            <div className="flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tell me about your business..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                    <Send className="w-5 h-5" />
                    Send
                </button>
            </div>
        </div>
    );
}

