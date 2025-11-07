"use client";
import React from "react";
import { CustomerStat } from "@/app/[locale]/dashboard/customers/page";
import { Users } from "lucide-react";
import { useTranslations } from 'next-intl';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Props {
    data: CustomerStat[];
    loading: boolean;
    selected: string[];
    onSelect: (id: string, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
    hasWhatsApp?: boolean;
}

export default function CustomerTable({ data, loading, selected, onSelect, onSelectAll, hasWhatsApp = false }: Props) {
    const t = useTranslations('customers');
    const allSelected = data.length > 0 && selected.length === data.length;

    const getStatusStyle = (status?: string) => {
        switch (status) {
        case "confirmed":
            return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
        case "cancelled":
            return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
        case "delivered":
            return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
        case "new":
            return "bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 text-[var(--brand-blue)] dark:text-[var(--brand-blue)]/80";
        default:
            return "bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200";
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                    <tr className="text-xs uppercase text-gray-600 dark:text-gray-300 tracking-wide">
                        <th className="px-3 sm:px-4 py-3">
                            <input 
                                type="checkbox" 
                                checked={allSelected} 
                                onChange={(e) => onSelectAll(e.target.checked)} 
                                disabled={!hasWhatsApp}
                                className="h-4 w-4 rounded border-gray-300 text-[var(--brand-blue)] focus:ring-[var(--brand-blue)] disabled:opacity-50 disabled:cursor-not-allowed"
                                title={!hasWhatsApp ? t('table.whatsappRequired') : undefined}
                            />
                        </th>
                        <th className="px-3 sm:px-4 py-3">{t('table.columns.name')}</th>
                        <th className="px-3 sm:px-4 py-3 hidden md:table-cell">{t('table.columns.email')}</th>
                        <th className="px-3 sm:px-4 py-3 hidden lg:table-cell">{t('table.columns.phone')}</th>
                        <th className="px-3 sm:px-4 py-3 hidden lg:table-cell">{t('table.columns.address')}</th>
                        <th className="px-3 sm:px-4 py-3 text-right">{t('table.columns.orders')}</th>
                        <th className="px-3 sm:px-4 py-3 text-right hidden sm:table-cell">{t('table.columns.delivered')}</th>
                        <th className="px-3 sm:px-4 py-3 text-right hidden sm:table-cell">{t('table.columns.cancelled')}</th>
                        <th className="px-3 sm:px-4 py-3 text-right">{t('table.columns.spent')}</th>
                        <th className="px-3 sm:px-4 py-3 hidden md:table-cell">{t('table.columns.lastOrder')}</th>
                        <th className="px-3 sm:px-4 py-3">{t('table.columns.status')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {loading ? (
                        <tr>
                            <td colSpan={11} className="px-4 py-12 text-center">
                                <LoadingSpinner size="md" text={t('table.loading')} />
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={11} className="px-4 py-12 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <Users className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('table.empty')}</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((c) => (
                            <tr
                                key={c.customerId}
                                className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                                    selected.includes(c.customerId) ? "bg-[var(--brand-blue)]/5 dark:bg-[var(--brand-blue)]/10" : ""
                                }`}
                            >
                                <td className="px-3 sm:px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(c.customerId)}
                                        onChange={(e) => onSelect(c.customerId, e.target.checked)}
                                        disabled={!hasWhatsApp}
                                        className="h-4 w-4 rounded border-gray-300 text-[var(--brand-blue)] focus:ring-[var(--brand-blue)] disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={!hasWhatsApp ? t('table.whatsappRequired') : undefined}
                                    />
                                </td>
                                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">{c.name ?? t('table.guest')}</td>
                                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate max-w-[150px] hidden md:table-cell">{c.email ?? "—"}</td>
                                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden lg:table-cell">{c.phone ?? "—"}</td>
                                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate max-w-[150px] hidden lg:table-cell">
                                    {c.address?.address ?? t('table.noAddress')}
                                    {c.address?.city ? `, ${c.address.city}` : ""}
                                    {c.address?.country ? `, ${c.address.country}` : ""}
                                </td>
                                <td className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-[var(--brand-blue)]">{c.totalOrders}</td>
                                <td className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm text-green-500 hidden sm:table-cell">{c.deliveredOrders}</td>
                                <td className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm text-red-500 hidden sm:table-cell">{c.cancelledOrders}</td>
                                <td className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-[var(--brand-blue)]">${Number(c.totalSpent ?? 0).toFixed(2)}</td>
                                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">
                                    {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "—"}
                                </td>
                                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                                    <span className={`inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${getStatusStyle(c.lastOrderStatus ?? undefined)}`}>
                                        {c.lastOrderStatus ?? "—"}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
