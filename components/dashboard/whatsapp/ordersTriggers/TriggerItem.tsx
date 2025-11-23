'use client';
import { Edit3, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface OrderMessageTrigger {
    _id: string;
    whatsappAccountId: string;
    name: string;
    orderStatus: string;
    template: string;
    active: boolean;
    auto: boolean;
    createdAt: string;
    updatedAt: string;
}

interface TriggerItemProps {
    trigger: OrderMessageTrigger;
    onToggleAuto: (id: string, active: boolean) => void;
    onEdit: (trigger: OrderMessageTrigger) => void;
    onDelete: (id: string) => void;
}

export default function TriggerItem({ trigger, onToggleAuto, onEdit, onDelete }: TriggerItemProps) {
    const t = useTranslations('whatsapp.ordersTriggers');

    const getStatusBadgeColor = (status: string) => {
        const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
        delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        refunded: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        returned: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };
        return colors[status] || colors.pending;
    };

    return (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[var(--brand-blue)]/20 dark:hover:border-[var(--brand-blue)]/20 transition-all p-5 rounded-xl shadow-sm hover:shadow-md dark:shadow-gray-900/30 space-y-4"
        >
        <div className="flex flex-col h-full justify-between gap-4">
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {trigger.name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{t('form.orderStatus')}:</span>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(trigger.orderStatus)}`}>
                                {t(`status.${trigger.orderStatus}`)}
                            </span>
                             {trigger.auto && (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                    Auto
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={trigger.active}
                            onChange={() => onToggleAuto(trigger._id, !trigger.active)}
                        />
                        <div className={`w-14 h-7 rounded-full transition-colors ${
                            trigger.active ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}></div>
                        <div className={`absolute left-1 top-1 w-5 h-5 bg-white dark:bg-gray-100 rounded-full shadow-sm transition-transform ${
                            trigger.active ? 'translate-x-7' : ''
                        }`}></div>
                    </label>
                </div>
                
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('template')}:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700 max-h-24 overflow-y-auto">
                    {trigger.template}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEdit(trigger)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title={t('edit')}
                >
                    <Edit3 className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDelete(trigger._id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title={t('delete')}
                >
                    <Trash2 className="w-4 h-4" />
                </motion.button>
            </div>
        </div>
        </motion.div>
    );
}
