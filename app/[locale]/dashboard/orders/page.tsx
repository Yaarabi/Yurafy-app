
'use client'
import OrdersTableWhatPlan from '@/components/dashboard/order/OrdersTableWhatPlan';
import {useTranslations} from 'next-intl';
import { useUserFeatures } from '@/hooks/useUserFeatures';
import LogoLoader from '@/components/themePreview/loadder';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrdersPage() {
    const t = useTranslations('orders');
    const { data: featuresData, loading } = useUserFeatures();
    const hasWhatsApp = featuresData?.planFeatures?.hasWhatsApp ?? false;
    
    if (loading) return <LogoLoader />;
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="p-2 bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-lg">
                        <ShoppingCart className="w-6 h-6 text-[var(--brand-blue)]" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{t('title')}</h2>
                </motion.div>

                {/* Table Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div className="p-4 sm:p-6">
                        <OrdersTableWhatPlan hasWhatsApp={hasWhatsApp} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
