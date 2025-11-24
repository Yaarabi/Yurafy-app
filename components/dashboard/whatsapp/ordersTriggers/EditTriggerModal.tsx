'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Template {
    _id: string;
    name: string;
    content?: string;
    status: string;
}

interface OrderMessageTrigger {
    _id: string;
    whatsappAccountId: string;
    name: string;
    orderStatus: string;
    template: string;
    active: boolean;
    auto: boolean;
    timing?: number;
}

interface EditTriggerModalProps {
    trigger: OrderMessageTrigger;
    onClose: () => void;
    onUpdate: (id: string, data: any) => void;
    templates: Template[];
}

const ORDER_STATUSES = [
    'new',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled'
];

export default function EditTriggerModal({ trigger, onClose, onUpdate, templates }: EditTriggerModalProps) {
    const t = useTranslations('whatsapp.ordersTriggers');
    const [formData, setFormData] = useState({
        name: trigger.name || '',
        orderStatus: trigger.orderStatus || '',
        template: trigger.template || '',
        active: trigger.active || false,
        auto: trigger.auto || false,
        timing: trigger.timing || 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name?.trim() || !formData.orderStatus || !formData.template) {
        return;
        }

        setIsSubmitting(true);
        try {
        await onUpdate(trigger._id, formData);
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80"
                onClick={onClose}
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
            </span>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <Edit3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('editTrigger')}
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Trigger Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.triggerName')}
                    </label>
                    <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('form.triggerNamePlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                    />
                </div>

                {/* Order Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.orderStatus')}
                    </label>
                    <select
                    value={formData.orderStatus}
                    onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                    >
                    <option value="">{t('form.selectStatus')}</option>
                    {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                        {t(`status.${status}`)}
                        </option>
                    ))}
                    </select>
                </div>

                {/* Template Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.template')}
                    </label>
                    <select
                    value={formData.template}
                    onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                    >
                    <option value="">{t('form.selectTemplate')}</option>
                    {templates.map((template) => (
                        <option key={template._id} value={template.name}>
                        {template.name} ({template.status})
                        </option>
                    ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('form.templateHint')}
                    </p>
                </div>

                {/* Timing */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.timing')}
                    </label>
                    <input
                    type="number"
                    min="0"
                    value={formData.timing}
                    onChange={(e) => setFormData({ ...formData, timing: parseInt(e.target.value) || 0 })}
                    placeholder={t('form.timingPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('form.timingHint')}
                    </p>
                </div>

                {/* Active Toggle */}
                <div>
                    <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('form.enableActive')}
                    </span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                    {t('form.activeHint')}
                    </p>
                </div>

                {/* Auto Toggle */}
                <div>
                    <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={formData.auto}
                        onChange={(e) => setFormData({ ...formData, auto: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('form.enableAuto')}
                    </span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                    {t('form.autoHint')}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <motion.button
                    type="button"
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                    {t('form.cancel')}
                    </motion.button>
                    
                    <motion.button
                    type="submit"
                    disabled={isSubmitting || !formData.name?.trim() || !formData.orderStatus || !formData.template}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                    {isSubmitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {isSubmitting ? t('form.saving') : t('form.save')}
                    </motion.button>
                </div>
                </form>
            </motion.div>
            </div>
        </div>
        </AnimatePresence>
    );
}