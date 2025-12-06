"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, MessageSquare, Briefcase, Bot, RefreshCw, ExternalLink, Trash2, CheckCircle } from "lucide-react";

interface AdminNotification {
    _id: string;
    type: 'support_message' | 'service_inquiry' | 'agent_note';
    title: string;
    message: string;
    link?: string;
    metadata?: {
        userId?: string;
        userName?: string;
        userEmail?: string;
        serviceType?: string;
        status?: string;
    };
    read: boolean;
    createdAt: string;
}

export default function AdminNotificationsArea() {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'support' | 'services' | 'agent'>('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/notifications');
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Failed to fetch notifications:', errorData);
                throw new Error(errorData.error || 'Failed to fetch notifications');
            }
            const data = await response.json();
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch('/api/admin/notifications/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId: id }),
            });

            if (response.ok) {
                setNotifications(notifications.map(n => 
                    n._id === id ? { ...n, read: true } : n
                ));
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const response = await fetch('/api/admin/notifications/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId: id }),
            });

            if (response.ok) {
                setNotifications(notifications.filter(n => n._id !== id));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'support_message':
                return <MessageSquare className="w-5 h-5 text-blue-600" />;
            case 'service_inquiry':
                return <Briefcase className="w-5 h-5 text-purple-600" />;
            case 'agent_note':
                return <Bot className="w-5 h-5 text-green-600" />;
            default:
                return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'support') return n.type === 'support_message';
        if (filter === 'services') return n.type === 'service_inquiry';
        if (filter === 'agent') return n.type === 'agent_note';
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Bell className="w-6 h-6 text-indigo-600" />
                            Admin Notifications
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={fetchNotifications}
                        disabled={loading}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'all'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'unread'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        Unread ({unreadCount})
                    </button>
                    <button
                        onClick={() => setFilter('support')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'support'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        Support ({notifications.filter(n => n.type === 'support_message').length})
                    </button>
                    <button
                        onClick={() => setFilter('services')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'services'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        Services ({notifications.filter(n => n.type === 'service_inquiry').length})
                    </button>
                    <button
                        onClick={() => setFilter('agent')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'agent'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        Agent Notes ({notifications.filter(n => n.type === 'agent_note').length})
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <Bell className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">No notifications to display</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredNotifications.map((notification) => (
                            <motion.div
                                key={notification._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border transition-all ${
                                    notification.read
                                        ? 'border-gray-200 dark:border-gray-700'
                                        : 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10'
                                }`}
                            >
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {notification.title}
                                            </h3>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            {notification.message}
                                        </p>
                                        {notification.metadata && (
                                            <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1 mb-3">
                                                {notification.metadata.userName && (
                                                    <p>User: {notification.metadata.userName}</p>
                                                )}
                                                {notification.metadata.userEmail && (
                                                    <p>Email: {notification.metadata.userEmail}</p>
                                                )}
                                                {notification.metadata.serviceType && (
                                                    <p>Service: {notification.metadata.serviceType}</p>
                                                )}
                                                {notification.metadata.status && (
                                                    <p>Status: <span className="capitalize">{notification.metadata.status}</span></p>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1"
                                                >
                                                    <CheckCircle className="w-3 h-3" />
                                                    Mark as Read
                                                </button>
                                            )}
                                            {notification.link && (
                                                <a
                                                    href={notification.link}
                                                    className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    View
                                                </a>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification._id)}
                                                className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
