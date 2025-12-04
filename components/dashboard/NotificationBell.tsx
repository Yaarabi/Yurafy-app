"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, ExternalLink, Bot, Package, CreditCard, AlertTriangle, MessageSquare, UserCog, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

interface NotificationMetadata {
    action?: string;
    orderId?: string;
    customerPhone?: string;
    customerName?: string;
    newStatus?: string;
    templateName?: string;
    success?: boolean;
    error?: string;
    [key: string]: any;
}

interface Notification {
    _id: string;
    type: 'support_reply' | 'order_update' | 'plan_expiry' | 'plan_warning' | 'plan_limit_reached' | 'plan_subscription' | 'welcome' | 'system' | 'admin_message' | 'agent';
    title: string;
    message: string;
    read: boolean;
    link?: string;
    metadata?: NotificationMetadata;
    createdAt: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const t = useTranslations('dashboard.notifications');
    const locale = useLocale();
    const router = useRouter();

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
                toast.success(t('markAllSuccess'));
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error(t('markAllError'));
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
            toast.error(t('deleteError'));
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
                toast.success(t('deleteReadSuccess'));
            }
        } catch (error) {
            console.error('Error deleting read notifications:', error);
            toast.error(t('deleteReadError'));
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
            plan_limit_reached: '🚫',
            plan_subscription: '💳',
            welcome: '👋',
            system: '🔔',
            admin_message: '👤',
            agent: '🤖',
        };
        return icons[type] || '🔔';
    };

    const getNotificationColor = (type: string) => {
        const colors: Record<string, string> = {
            support_reply: 'bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]',
            order_update: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            plan_expiry: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            plan_warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            plan_limit_reached: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            plan_subscription: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            welcome: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            system: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            admin_message: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            agent: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getActionBadge = (action?: string, newStatus?: string) => {
        if (!action) return null;
        
        const badges: Record<string, { label: string; color: string }> = {
            'order_confirmation': { label: 'Confirmed', color: 'bg-green-500' },
            'cancel_order': { label: 'Cancelled', color: 'bg-red-500' },
            'edit_order': { label: 'Edit Request', color: 'bg-yellow-500' },
            'create_order': { label: 'Created', color: 'bg-blue-500' },
            'update_status': { label: newStatus || 'Updated', color: 'bg-purple-500' },
            'send_template': { label: 'Template Sent', color: 'bg-indigo-500' },
        };
        
        const badge = badges[action];
        if (!badge) return null;
        
        return (
            <span className={`${badge.color} text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium`}>
                {badge.label}
            </span>
        );
    };

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        if (!notification.read) {
            markAsRead(notification._id);
        }
        
        // Navigate to link if available
        if (notification.link) {
            setIsOpen(false);
            // Add locale to the link if it doesn't already have it
            const linkWithLocale = notification.link.startsWith('/') && !notification.link.startsWith(`/${locale}`)
                ? `/${locale}${notification.link}`
                : notification.link;
            router.push(linkWithLocale);
        } else {
            // Toggle expanded view for metadata
            setExpandedId(expandedId === notification._id ? null : notification._id);
        }
    };

    const formatMetadataValue = (key: string, value: any): string => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? '✓ Yes' : '✗ No';
        if (key.toLowerCase().includes('phone')) return value;
        if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) {
            return new Date(value).toLocaleString();
        }
        return String(value);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={t('title')}
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
                        className="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto top-16 sm:top-auto sm:mt-2 w-auto sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[calc(100vh-80px)] sm:max-h-[500px] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{t('title')}</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        disabled={loading}
                                        className="text-xs text-[var(--brand-blue)] hover:text-[var(--brand-blue)]/80 dark:text-[var(--brand-blue)] dark:hover:text-[var(--brand-blue)]/80 font-medium disabled:opacity-50"
                                        title={t('markAllRead')}
                                    >
                                        {t('markAllRead')}
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    aria-label={t('close')}
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
                                    <p className="text-sm">{t('empty')}</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                                                !notification.read ? 'bg-[var(--brand-blue)]/5 dark:bg-[var(--brand-blue)]/10' : ''
                                            }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`text-xl flex-shrink-0 ${!notification.read ? 'animate-pulse' : ''}`}>
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className={`font-medium text-sm ${
                                                                !notification.read
                                                                    ? 'text-gray-900 dark:text-white font-semibold'
                                                                    : 'text-gray-700 dark:text-gray-300'
                                                            }`}>
                                                                {notification.title}
                                                            </h4>
                                                            {getActionBadge(notification.metadata?.action, notification.metadata?.newStatus)}
                                                        </div>
                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            {!notification.read && (
                                                                <div className="w-2 h-2 bg-[var(--brand-blue)] rounded-full"></div>
                                                            )}
                                                            {notification.link && (
                                                                <ExternalLink className="w-3 h-3 text-gray-400" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                        {notification.message}
                                                    </p>
                                                    
                                                    {/* Metadata display for agent notifications */}
                                                    {notification.metadata && notification.type === 'agent' && (
                                                        <div className={`mt-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs ${
                                                            expandedId === notification._id ? '' : 'hidden'
                                                        }`}>
                                                            <div className="grid grid-cols-2 gap-1">
                                                                {notification.metadata.customerName && (
                                                                    <div>
                                                                        <span className="text-gray-500 dark:text-gray-500">Customer:</span>
                                                                        <span className="ml-1 text-gray-700 dark:text-gray-300 font-medium">
                                                                            {notification.metadata.customerName}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {notification.metadata.customerPhone && (
                                                                    <div>
                                                                        <span className="text-gray-500 dark:text-gray-500">Phone:</span>
                                                                        <span className="ml-1 text-gray-700 dark:text-gray-300 font-mono">
                                                                            {notification.metadata.customerPhone}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {notification.metadata.orderId && (
                                                                    <div>
                                                                        <span className="text-gray-500 dark:text-gray-500">Order:</span>
                                                                        <span className="ml-1 text-gray-700 dark:text-gray-300 font-mono text-[10px]">
                                                                            {notification.metadata.orderId.slice(-8)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {notification.metadata.newStatus && (
                                                                    <div>
                                                                        <span className="text-gray-500 dark:text-gray-500">Status:</span>
                                                                        <span className={`ml-1 font-medium capitalize ${
                                                                            notification.metadata.newStatus === 'confirmed' ? 'text-green-600 dark:text-green-400' :
                                                                            notification.metadata.newStatus === 'cancelled' ? 'text-red-600 dark:text-red-400' :
                                                                            'text-gray-700 dark:text-gray-300'
                                                                        }`}>
                                                                            {notification.metadata.newStatus}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {notification.metadata.templateName && (
                                                                    <div className="col-span-2">
                                                                        <span className="text-gray-500 dark:text-gray-500">Template:</span>
                                                                        <span className="ml-1 text-gray-700 dark:text-gray-300">
                                                                            {notification.metadata.templateName}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {notification.metadata.success !== undefined && (
                                                                    <div>
                                                                        <span className="text-gray-500 dark:text-gray-500">Result:</span>
                                                                        <span className={`ml-1 font-medium ${
                                                                            notification.metadata.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                                        }`}>
                                                                            {notification.metadata.success ? '✓ Success' : '✗ Failed'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {notification.metadata.error && (
                                                                    <div className="col-span-2">
                                                                        <span className="text-red-500">Error:</span>
                                                                        <span className="ml-1 text-red-600 dark:text-red-400">
                                                                            {notification.metadata.error}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Show expand hint for agent notifications with metadata */}
                                                    {notification.metadata && notification.type === 'agent' && expandedId !== notification._id && (
                                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                                            Click to see details
                                                        </p>
                                                    )}
                                                    
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-[10px] text-gray-500 dark:text-gray-500">
                                                            {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                            {!notification.read && (
                                                                <button
                                                                    onClick={() => markAsRead(notification._id)}
                                                                    disabled={loading}
                                                                    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                                                                    title={t('markRead')}
                                                                >
                                                                    <Check className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => deleteNotification(notification._id)}
                                                                disabled={loading}
                                                                className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                                                                title={t('delete')}
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
                                    {t('clearAllRead')}
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

