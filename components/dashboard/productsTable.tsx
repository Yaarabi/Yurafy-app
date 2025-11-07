'use client';

import { useEffect, useState } from "react";
import { IProduct } from "@/models/products";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function ProductsTable() {
    const t = useTranslations('products');
    const { data: session } = useSession();
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const { locale } = useParams();

    const columns = [
        { key: "index", label: "#" },
        { key: "name", label: t('columns.name') },
        { key: "price", label: t('columns.price') },
        { key: "stock", label: t('columns.stock') },
        { key: "salesCount", label: t('columns.salesCount') },
    ] as const;

    useEffect(() => {
        if (!session?.user?.id) {
            setLoading(false);
            return;
        }

        async function fetchProducts() {
            try {
                const ownerId = (session) ? session.user.id as string : "";
                const res = await fetch(`/api/products?owner=${ownerId}`);
                if (!res.ok) throw new Error("Failed to fetch products");
                const data = await res.json();
                setProducts(data.products || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [session]);

    // 🚨 Redirect if not logged in
    useEffect(() => {
        if (!session) {
            router.push(`/${locale}/login`);
        }
    }, [session, router, locale]);

    if (!session) return null; // render nothing while redirecting

    async function handleDelete(id: string) {
        if (!confirm(t('deleteConfirm'))) return;

        try {
            const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
            if (res.ok) setProducts((prev) => prev.filter((p) => p._id !== id));
            else console.error("Failed to delete product");
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className="px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                {col.label}
                            </th>
                        ))}
                        <th className="px-3 sm:px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm uppercase tracking-wider">{t('actions')}</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length + 1} className="px-4 py-12 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 border-4 border-[var(--brand-blue)] border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('loading')}</p>
                                </div>
                            </td>
                        </tr>
                    ) : products.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + 1} className="px-4 py-12 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('empty')}</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        products.map((row, i) => (
                            <tr key={row._id} className="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">{i + 1}</td>
                                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-medium truncate max-w-[150px] sm:max-w-none">{row.name}</td>
                                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-semibold text-[var(--brand-blue)]">${row.price?.toFixed(2)}</td>
                                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200">{row.stock || 0}</td>
                                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200">{row.salesCount || 0}</td>
                                <td className="px-3 sm:px-4 py-3">
                                    <div className="flex gap-2 sm:gap-3">
                                        <button 
                                            onClick={() => router.push(`/${locale}/dashboard/products/${row._id}`)}
                                            className="p-1.5 sm:p-2 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/10 dark:hover:bg-[var(--brand-blue)]/20 rounded-lg transition-all hover:scale-110" 
                                            title="Edit product"
                                        >
                                            <FaEdit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(row._id ?? "")}
                                            className="p-1.5 sm:p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hover:scale-110" 
                                            title="Delete product"
                                        >
                                            <FaTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
