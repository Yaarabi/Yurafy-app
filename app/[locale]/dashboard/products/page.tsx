'use client'
import { useTranslations } from 'next-intl';
import ProductsTable from '@/components/dashboard/productsTable';
import { useParams, useRouter } from 'next/navigation';

export default function ProductsPage() {
    const t = useTranslations('products');
    const params = useParams();
    const router = useRouter();

    return (
        <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">{t('title')}</h2>
            <button
            onClick={() => router.push(`/${params?.locale}/dashboard/products/new`)}
            className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
            >
            {t('new')}
            </button>
        </div>
        <ProductsTable />
        </div>
    );
}
