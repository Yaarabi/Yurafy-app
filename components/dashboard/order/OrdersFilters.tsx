'use client';
import { IOrder } from '@/models/orders';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type OrdersFiltersType = {
    product: string;
    address: string;
    status: "" | "new" | "confirmed" | "shipped" | "delivered" | "cancelled";
    date: string;
};

interface OrdersFiltersProps {
    filters: OrdersFiltersType;
    setFilters: React.Dispatch<React.SetStateAction<OrdersFiltersType>>;
    orders: IOrder[];
}

export default function OrdersFilters({ filters, setFilters }: OrdersFiltersProps) {
    const t = useTranslations('orders.filters');
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Count active filters
    const activeFiltersCount = [
        filters.product,
        filters.address,
        filters.status,
        filters.date
    ].filter(Boolean).length;
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Mobile Header - Collapsible */}
            <div className="sm:hidden">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[var(--brand-blue)]" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('label')}
                        </span>
                        {activeFiltersCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-[var(--brand-blue)] text-white text-xs font-medium">
                                {activeFiltersCount}
                            </span>
                        )}
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                </button>
                
                {/* Mobile Filters - Collapsible */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="p-3 pt-0 space-y-3 border-t border-gray-200 dark:border-gray-700">
                                <input
                                    placeholder={t('productPlaceholder')}
                                    value={filters.product}
                                    onChange={(e) =>
                                        setFilters((prev) => ({ ...prev, product: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-colors"
                                />
                                <input
                                    placeholder={t('addressPlaceholder')}
                                    value={filters.address}
                                    onChange={(e) =>
                                        setFilters((prev) => ({ ...prev, address: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-colors"
                                />
                                <select
                                    value={filters.status}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            status: e.target.value as OrdersFiltersType['status'],
                                        }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-colors"
                                >
                                    <option value="">{t('allStatus')}</option>
                                    <option value="new">{t('status.new')}</option>
                                    <option value="confirmed">{t('status.confirmed')}</option>
                                    <option value="shipped">{t('status.shipped')}</option>
                                    <option value="delivered">{t('status.delivered')}</option>
                                    <option value="cancelled">{t('status.cancelled')}</option>
                                </select>
                                <input
                                    type="date"
                                    value={filters.date}
                                    onChange={(e) =>
                                        setFilters((prev) => ({ ...prev, date: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-colors"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Desktop View - Always visible */}
            <div className="hidden sm:block p-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Filter className="w-4 h-4 text-[var(--brand-blue)]" />
                        <span>{t('label')}</span>
                    </div>
                    <input
                        placeholder={t('productPlaceholder')}
                        value={filters.product}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, product: e.target.value }))
                        }
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-colors flex-1 min-w-[150px]"
                    />
                    <input
                        placeholder={t('addressPlaceholder')}
                        value={filters.address}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, address: e.target.value }))
                        }
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-colors flex-1 min-w-[150px]"
                    />
                    <select
                        value={filters.status}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                status: e.target.value as OrdersFiltersType['status'],
                            }))
                        }
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-colors"
                    >
                        <option value="">{t('allStatus')}</option>
                        <option value="new">{t('status.new')}</option>
                        <option value="confirmed">{t('status.confirmed')}</option>
                        <option value="shipped">{t('status.shipped')}</option>
                        <option value="delivered">{t('status.delivered')}</option>
                        <option value="cancelled">{t('status.cancelled')}</option>
                    </select>
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, date: e.target.value }))
                        }
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-colors"
                    />
                </div>
            </div>
        </div>
    );
}
