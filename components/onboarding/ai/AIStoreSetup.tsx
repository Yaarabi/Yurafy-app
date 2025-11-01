'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ConfirmationData {
    message: string;
    requiresConfirmation: boolean;
}

export default function AIStoreSetup({ 
    plan, 
    onComplete 
}: { 
    plan: string; 
    onComplete: (storeData: any) => void;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = searchParams.get('locale') || 'en';

    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: `Hello! I'm your AI store setup assistant. I'll help you create your online store step by step. Let's start! What kind of business are you running? Tell me about your brand, products, or services.`
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [threadId, setThreadId] = useState<string | null>(null);
    const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);

    // Detect if agent is asking for confirmation
    const detectConfirmationRequest = (message: string): boolean => {
        const confirmationKeywords = [
            'would you like',
            'should i',
            'confirm',
            'proceed',
            'create your store',
            'these details',
            'ready to create',
            'does this look good',
            'is this correct'
        ];
        return confirmationKeywords.some(keyword => 
            message.toLowerCase().includes(keyword.toLowerCase())
        );
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setConfirmationData(null); // Clear previous confirmation

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

                // Check if agent is asking for confirmation
                if (detectConfirmationRequest(data.message)) {
                    setConfirmationData({
                        message: data.message,
                        requiresConfirmation: true,
                    });
                }

                // Check if store was created successfully
                if (data.storeCreated) {
                    toast.success('Store created successfully!');
                    // Redirect to checkout after short delay
                    setTimeout(() => {
                        router.push(`/${locale}/onboarding/checkout?plan=${plan}`);
                    }, 2000);
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

    const handleConfirm = async () => {
        const confirmationMessage = "Yes, please create the store with these details.";
        setConfirmationData(null);
        setInput(confirmationMessage);
        
        // Send confirmation message
        const userMessage: Message = { role: 'user', content: confirmationMessage };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            const response = await fetch('/api/onboarding/ai-setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: confirmationMessage,
                    plan,
                    threadId: threadId || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.message || 'Processing your request...',
                };
                setMessages(prev => [...prev, assistantMessage]);

                if (data.storeCreated) {
                    toast.success('Store created successfully!');
                    setTimeout(() => {
                        router.push(`/${locale}/onboarding/checkout?plan=${plan}`);
                    }, 2000);
                } else if (detectConfirmationRequest(data.message)) {
                    setConfirmationData({
                        message: data.message,
                        requiresConfirmation: true,
                    });
                }
            } else {
                toast.error(data.error || 'Failed to process confirmation');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
            setInput('');
        }
    };

    const handleReject = () => {
        setConfirmationData(null);
        // Just clear the confirmation, user can type their response
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

            {/* Confirmation UI - Shows when agent asks for confirmation */}
            <AnimatePresence>
                {confirmationData && confirmationData.requiresConfirmation && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-amber-200"
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirmation Required</h3>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleConfirm}
                                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Yes, Create Store
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
                            >
                                Make Changes
                            </button>
                        </div>
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
                    placeholder={confirmationData?.requiresConfirmation ? "Please use the confirmation buttons above..." : "Tell me about your business..."}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={loading || (confirmationData !== null && confirmationData.requiresConfirmation)}
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim() || (confirmationData !== null && confirmationData.requiresConfirmation)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                    <Send className="w-5 h-5" />
                    Send
                </button>
            </div>
        </div>
    );
}

