'use client'
import { useTranslations } from 'next-intl';
import ProductsTable from '@/components/dashboard/productsTable';
import { useParams, useRouter } from 'next/navigation';

export default function ProductsPage() {
    const t = useTranslations('products');
    const params = useParams();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 p-6 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('title')}</h2>
            <button
            onClick={() => router.push(`/${params?.locale}/dashboard/products/new`)}
            className="px-4 py-2 rounded-md bg-brand-blue hover:opacity-90 text-white font-medium transition"
            >
            {t('new')}
            </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <ProductsTable />
        </div>
        </div>
    );
}
