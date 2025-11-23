'use client';
import { Settings2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OrderMessageTrigger {
    _id: string;
    active: boolean;
}

interface TriggerStatsProps {
    triggers: OrderMessageTrigger[];
}

export default function TriggerStats({ triggers }: TriggerStatsProps) {
    const t = useTranslations('whatsapp.ordersTriggers');

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalTriggers')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{triggers.length}</p>
            </div>
            <div className="p-3 bg-[var(--brand-blue)]/10 rounded-lg">
                <Settings2 className="w-6 h-6 text-[var(--brand-blue)]" />
            </div>
            </div>
        </div>
        
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('activeTriggers')}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {triggers.filter(t => t.active).length}
                </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <ToggleRight className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('inactiveTriggers')}</p>
                <p className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                {triggers.filter(t => !t.active).length}
                </p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <ToggleLeft className="w-6 h-6 text-gray-500" />
            </div>
            </div>
        </div>
        </div>
    );
}
