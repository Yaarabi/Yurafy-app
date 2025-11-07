"use client";

import { Filter } from "lucide-react";
import { useTranslations } from 'next-intl';

interface Props {
    filters: { status: string; address: string };
    onChange: (filters: { status: string; address: string }) => void;
}

export default function CustomerFilters({ filters, onChange }: Props) {
    const t = useTranslations('customers.filters');
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Filter className="w-4 h-4 text-[var(--brand-blue)]" />
                    <span>{t('label')}</span>
                </div>
                {/* Status Filter */}
                <select
                    value={filters.status}
                    onChange={(e) => onChange({ ...filters, status: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-colors"
                >
                    <option value="All">{t('allStatus')}</option>
                    <option value="confirmed">{t('status.confirmed')}</option>
                    <option value="cancelled">{t('status.cancelled')}</option>
                    <option value="delivered">{t('status.delivered')}</option>
                    <option value="new">{t('status.new')}</option>
                </select>

                {/* Address Filter */}
                <input
                    type="text"
                    placeholder={t('addressPlaceholder')}
                    value={filters.address}
                    onChange={(e) => onChange({ ...filters, address: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-colors flex-1 min-w-[200px]"
                />
            </div>
        </div>
    );
}
