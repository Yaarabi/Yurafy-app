
'use client'
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import ProductsTable from '@/components/dashboard/productsTable';
import { useParams, useRouter } from 'next/navigation';

export default function ProductsPage() {
    const t = useTranslations('products');
    const params = useParams()
    const router = useRouter()

    return (
        <div className="grid gap-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('title')}</h2>
            <button
            onClick={() => router.push(`/${params?.locale}/dashboard/products/new`)}
            className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white"
            >
            {t('new')}
            </button>
        </div>
        <ProductsTable/>
        </div>
    );
}
