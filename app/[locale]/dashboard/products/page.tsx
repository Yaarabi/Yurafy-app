'use client'
import { useTranslations } from 'next-intl';
import ProductsTable from '@/components/dashboard/productsTable';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductsPage() {
    const t = useTranslations('products');
    const params = useParams();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-lg">
                            <Package className="w-6 h-6 text-[var(--brand-blue)]" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{t('title')}</h2>
                    </div>
                    <button
                        onClick={() => router.push(`/${params?.locale}/dashboard/products/new`)}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">{t('new')}</span>
                    </button>
                </motion.div>

                {/* Table Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <ProductsTable />
                </motion.div>
            </div>
        </div>
    );
}
