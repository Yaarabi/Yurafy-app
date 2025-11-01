"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Notification {
    _id: string;
    type: 'support_reply' | 'order_update' | 'plan_expiry' | 'plan_warning' | 'system' | 'admin_message';
    title: string;
    message: string;
    read: boolean;
    link?: string;
    createdAt: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications?limit=20');
            if (!response.ok) return;
            
            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            setLoading(true);
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notificationIds: [notificationId],
                    read: true,
                }),
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
        if (unreadIds.length === 0) return;

        try {
            setLoading(true);
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notificationIds: unreadIds,
                    read: true,
                }),
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
                toast.success('All notifications marked as read');
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        } finally {
            setLoading(false);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/notifications?id=${notificationId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => n._id !== notificationId));
                const deleted = notifications.find(n => n._id === notificationId);
                if (deleted && !deleted.read) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        } finally {
            setLoading(false);
        }
    };

    const deleteAllRead = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/notifications?allRead=true', {
                method: 'DELETE',
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => !n.read));
                toast.success('All read notifications deleted');
            }
        } catch (error) {
            console.error('Error deleting read notifications:', error);
            toast.error('Failed to delete read notifications');
        } finally {
            setLoading(false);
        }
    };

    const getNotificationIcon = (type: string) => {
        const icons: Record<string, string> = {
            support_reply: '💬',
            order_update: '📦',
            plan_expiry: '⚠️',
            plan_warning: '⚠️',
            system: '🔔',
            admin_message: '👤',
        };
        return icons[type] || '🔔';
    };

    const getNotificationColor = (type: string) => {
        const colors: Record<string, string> = {
            support_reply: 'bg-blue-100 text-blue-800',
            order_update: 'bg-green-100 text-green-800',
            plan_expiry: 'bg-red-100 text-red-800',
            plan_warning: 'bg-yellow-100 text-yellow-800',
            system: 'bg-gray-100 text-gray-800',
            admin_message: 'bg-purple-100 text-purple-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.div>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[500px] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        disabled={loading}
                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                                        title="Mark all as read"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">No notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                                !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`text-xl ${!notification.read ? 'animate-pulse' : ''}`}>
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h4 className={`font-medium text-sm ${
                                                            !notification.read
                                                                ? 'text-gray-900 dark:text-white font-semibold'
                                                                : 'text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500 dark:text-gray-500">
                                                            {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {!notification.read && (
                                                                <button
                                                                    onClick={() => markAsRead(notification._id)}
                                                                    disabled={loading}
                                                                    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                                                                    title="Mark as read"
                                                                >
                                                                    <Check className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => deleteNotification(notification._id)}
                                                                disabled={loading}
                                                                className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && notifications.some(n => n.read) && (
                            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={deleteAllRead}
                                    disabled={loading}
                                    className="w-full text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                                >
                                    Clear all read notifications
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

