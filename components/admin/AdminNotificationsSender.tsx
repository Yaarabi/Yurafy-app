"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, Bell, Users, User, Loader2 } from "lucide-react";

type NotificationType = 'notification' | 'email' | 'both';
type RecipientType = 'all' | 'specific';

export default function AdminNotificationsSender() {
    const [type, setType] = useState<NotificationType>('notification');
    const [recipientType, setRecipientType] = useState<RecipientType>('all');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) {
            setResult({ success: false, message: 'Title and message are required' });
            return;
        }

        if (recipientType === 'specific' && !recipientEmail.trim()) {
            setResult({ success: false, message: 'Recipient email is required for specific user' });
            return;
        }

        setSending(true);
        setResult(null);

        try {
            const response = await fetch('/api/admin/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    recipientType,
                    recipientEmail: recipientType === 'specific' ? recipientEmail : undefined,
                    title,
                    message,
                    link: link.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setResult({ success: true, message: data.message || 'Sent successfully!' });
                // Clear form on success
                setTitle('');
                setMessage('');
                setLink('');
                setRecipientEmail('');
            } else {
                setResult({ success: false, message: data.error || 'Failed to send' });
            }
        } catch (error) {
            console.error('Error sending:', error);
            setResult({ success: false, message: 'Network error occurred' });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Send className="w-6 h-6 text-indigo-600" />
                    Send Notifications & Emails
                </h2>

                {/* Type Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Send Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setType('notification')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                type === 'notification'
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            <Bell className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">Notification Only</span>
                        </button>
                        <button
                            onClick={() => setType('email')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                type === 'email'
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            <Mail className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">Email Only</span>
                        </button>
                        <button
                            onClick={() => setType('both')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                type === 'both'
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            <div className="flex justify-center gap-1 mb-2">
                                <Bell className="w-5 h-5" />
                                <Mail className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium">Both</span>
                        </button>
                    </div>
                </div>

                {/* Recipient Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Recipients
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <button
                            onClick={() => setRecipientType('all')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                recipientType === 'all'
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            <Users className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">All Users</span>
                        </button>
                        <button
                            onClick={() => setRecipientType('specific')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                recipientType === 'specific'
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            <User className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">Specific User</span>
                        </button>
                    </div>
                    {recipientType === 'specific' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <input
                                type="email"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                placeholder="user@example.com"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </motion.div>
                    )}
                </div>

                {/* Title */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter notification/email title"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Message */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message *
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your message here..."
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
                    />
                </div>

                {/* Link (Optional) */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Link (Optional)
                    </label>
                    <input
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="/dashboard or https://example.com"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Result Message */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 p-4 rounded-lg ${
                            result.success
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                        }`}
                    >
                        {result.message}
                    </motion.div>
                )}

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={sending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {sending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Send {type === 'both' ? 'Notification & Email' : type === 'notification' ? 'Notification' : 'Email'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
