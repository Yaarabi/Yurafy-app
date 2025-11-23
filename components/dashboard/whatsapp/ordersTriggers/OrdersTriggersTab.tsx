'use client';
import { useEffect, useState } from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import AddTriggerModal from '@/components/dashboard/whatsapp/ordersTriggers/AddTriggerModal';
import EditTriggerModal from '@/components/dashboard/whatsapp/ordersTriggers/EditTriggerModal';
import TriggerStats from '@/components/dashboard/whatsapp/ordersTriggers/TriggerStats';
import TriggerItem from '@/components/dashboard/whatsapp/ordersTriggers/TriggerItem';

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

interface Template {
    _id: string;
    name: string;
    content?: string;
    status: string;
}

export default function OrdersTriggersTab() {
    const t = useTranslations('whatsapp.ordersTriggers');
    const [loading, setLoading] = useState(true);
    const [triggers, setTriggers] = useState<OrderMessageTrigger[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTrigger, setEditingTrigger] = useState<OrderMessageTrigger | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
        setLoading(true);
        const [triggersRes, templatesRes] = await Promise.all([
            fetch('/api/triggers'),
            fetch('/api/whatsapp/templates')
        ]);

        if (triggersRes.ok) {
            const triggersData = await triggersRes.json();
            setTriggers(triggersData.data || []);
        }

        if (templatesRes.ok) {
            const templatesData = await templatesRes.json();
            setTemplates(templatesData.templates || []);
        }
        } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(t('fetchError'));
        } finally {
        setLoading(false);
        }
    };

    const handleAddTrigger = async (triggerData: any) => {
        try {
        const response = await fetch('/api/triggers', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(triggerData),
        });

        if (response.ok) {
            const data = await response.json();
            setTriggers(prev => [...prev, data.data]);
            toast.success(t('addSuccess'));
            setShowAddModal(false);
        } else {
            const error = await response.json();
            toast.error(error.error || t('addError'));
        }
        } catch (error) {
        console.error('Error adding trigger:', error);
        toast.error(t('addError'));
        }
    };

    const handleUpdateTrigger = async (id: string, triggerData: any) => {
        try {
        const response = await fetch('/api/triggers', {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, ...triggerData }),
        });

        if (response.ok) {
            const data = await response.json();
            setTriggers(prev => 
            prev.map(trigger => trigger._id === id ? data.data : trigger)
            );
            toast.success(t('updateSuccess'));
            setEditingTrigger(null);
        } else {
            const error = await response.json();
            toast.error(error.error || t('updateError'));
        }
        } catch (error) {
        console.error('Error updating trigger:', error);
        toast.error(t('updateError'));
        }
    };

    const handleDeleteTrigger = async (id: string) => {
        if (!confirm(t('deleteConfirm'))) return;

        try {
        const response = await fetch(`/api/triggers?id=${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            setTriggers(prev => prev.filter(trigger => trigger._id !== id));
            toast.success(t('deleteSuccess'));
        } else {
            const error = await response.json();
            toast.error(error.error || t('deleteError'));
        }
        } catch (error) {
        console.error('Error deleting trigger:', error);
        toast.error(t('deleteError'));
        }
    };

    const handleToggleAuto = async (id: string, active: boolean) => {
        try {
        const response = await fetch('/api/triggers', {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, active }),
        });

        if (response.ok) {
            setTriggers(prev =>
            prev.map(trigger =>
                trigger._id === id ? { ...trigger, active } : trigger
            )
            );
            toast.success(active ? t('enabledSuccess') : t('disabledSuccess'));
        } else {
            const error = await response.json();
            toast.error(error.error || t('toggleError'));
        }
        } catch (error) {
        console.error('Error toggling trigger:', error);
        toast.error(t('toggleError'));
        }
    };

    if (loading) {
        return (
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-blue)]"></div>
        </div>
        );
    }

    return (
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-[var(--brand-blue)]" />
                {t('title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('description')}
            </p>
            </div>
            <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-blue)] text-white rounded-lg hover:bg-[var(--brand-blue)]/90 transition-colors font-medium"
            >
            <Plus className="w-4 h-4" />
            {t('addTrigger')}
            </motion.button>
        </div>

        {/* Statistics Cards */}
        <TriggerStats triggers={triggers} />

        {/* Triggers List */}
        {triggers.length === 0 ? (
            <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('noTriggers')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('noTriggersDescription')}</p>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-blue)] text-white rounded-lg hover:bg-[var(--brand-blue)]/90 transition-colors"
            >
                <Plus className="w-4 h-4" />
                {t('createFirst')}
            </motion.button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <AnimatePresence>
                {triggers.map((trigger, index) => (
                <TriggerItem
                    key={trigger._id}
                    trigger={trigger}
                    onToggleAuto={handleToggleAuto}
                    onEdit={setEditingTrigger}
                    onDelete={handleDeleteTrigger}
                />
                ))}
            </AnimatePresence>
            </div>
        )}

        {/* Add Trigger Modal */}
        {showAddModal && (
            <AddTriggerModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddTrigger}
            templates={templates}
            />
        )}

        {/* Edit Trigger Modal */}
        {editingTrigger && (
            <EditTriggerModal
            trigger={editingTrigger}
            onClose={() => setEditingTrigger(null)}
            onUpdate={handleUpdateTrigger}
            templates={templates}
            />
        )}
        </div>
    );
}