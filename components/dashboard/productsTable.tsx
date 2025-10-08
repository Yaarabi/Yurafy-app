'use client';

import { useEffect, useState } from "react";
import { IProduct } from "@/models/products";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

export default function ProductsTable() {
    const { data: session } = useSession();
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const { locale } = useParams();

    const columns = [
        { key: "index", label: "#" },
        { key: "name", label: "Name" },
        { key: "price", label: "Price" },
        { key: "stock", label: "Stock" },
        { key: "salesCount", label: "Sold" },
    ] as const;

    useEffect(() => {
        // ✅ Guard: only fetch if session and user id exist
        if (!session?.user?.id) {
        setLoading(false);
        return;
        }

        async function fetchProducts() {
        try {
            // ✅ Type assertion: session.user.id is string
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

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
        const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
        if (res.ok) {
            setProducts((prev) => prev.filter((p) => p._id !== id));
        } else {
            console.error("Failed to delete product");
        }
        } catch (err) {
        console.error(err);
        }
    }

    if (!session) {
        return router.push(`/${locale}/login`);
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-md shadow-lg">
        <table className="min-w-full text-sm">
            <thead className="bg-gray-800/70">
            <tr>
                {columns.map((col) => (
                <th
                    key={col.key}
                    className="px-4 py-3 text-left font-semibold text-gray-200 uppercase tracking-wider"
                >
                    {col.label}
                </th>
                ))}
                <th className="px-4 py-3 text-gray-200 font-semibold uppercase tracking-wider">
                Actions
                </th>
            </tr>
            </thead>

            <tbody>
            {loading ? (
                <tr>
                <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-gray-400">
                    Loading products...
                </td>
                </tr>
            ) : products.length === 0 ? (
                <tr>
                <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-gray-400">
                    No products found
                </td>
                </tr>
            ) : (
                products.map((row, i) => (
                <tr
                    key={row._id}
                    className={`border-t border-gray-800 transition-colors duration-150 hover:bg-gray-800/40 ${
                    i % 2 === 0 ? "bg-gray-900/40" : ""
                    }`}
                >
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 text-gray-300 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-gray-300">${row.price}</td>
                    <td className="px-4 py-3 text-gray-300">{row.stock}</td>
                    <td className="px-4 py-3 text-gray-300">{row.salesCount}</td>
                    <td className="px-4 py-3">
                    <div className="flex gap-3">
                        <button
                        onClick={() => (window.location.href = `/dashboard/products/${row._id}/edit`)}
                        className="text-indigo-400 hover:text-indigo-200 transition-transform hover:scale-110"
                        title="Edit product"
                        >
                        <FaEdit />
                        </button>
                        <button
                        onClick={() => handleDelete(row._id ? row._id : "")}
                        className="text-red-400 hover:text-red-200 transition-transform hover:scale-110"
                        title="Delete product"
                        >
                        <FaTrash />
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
