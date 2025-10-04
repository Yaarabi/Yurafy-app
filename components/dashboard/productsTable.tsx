'use client';

import { useEffect, useState } from "react";
import { IProduct } from "@/models/products"; 
import { FaEdit, FaTrash } from "react-icons/fa";

export default function ProductsTable() {
    const [products, setProducts] = useState<(IProduct & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);

    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "price", label: "Price" },
        { key: "stock", label: "Stock" },
        { key: "salesCount", label: "Sold" },
    ] as const;

    useEffect(() => {
        async function fetchProducts() {
        try {
            const res = await fetch("/api/products");
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            setProducts(
            data.map((p: any) => ({
                id: p._id,
                ...p,
            }))
            );
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
        }
        fetchProducts();
    }, []);

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
        const res = await fetch(`/api/products/${id}`, {
            method: "DELETE",
        });
        if (res.ok) {
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } else {
            console.error("Failed to delete product");
        }
        } catch (err) {
        console.error(err);
        }
    }
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="min-w-full">
            <thead className="bg-gray-800/50">
            <tr>
                {columns.map((col) => (
                <th
                    key={String(col.key)}
                    className="text-left px-4 py-2 text-gray-200 font-medium"
                >
                    {col.label}
                </th>
                ))}
                <th className="px-4 py-2 text-gray-200 font-medium">Actions</th>
            </tr>
            </thead>
            <tbody>
            {loading ? (
                <tr>
                <td
                    colSpan={columns.length + 1}
                    className="px-4 py-4 text-center text-gray-400"
                >
                    Loading...
                </td>
                </tr>
            ) : products.length === 0 ? (
                <tr>
                <td
                    colSpan={columns.length + 1}
                    className="px-4 py-4 text-center text-gray-400"
                >
                    No products found
                </td>
                </tr>
            ) : (
                products.map((row) => (
                <tr key={row.id} className="border-t border-gray-800">
                    {columns.map((col) => (
                    <td
                        key={String(col.key)}
                        className="px-4 py-2 text-gray-300"
                    >
                        {String(row[col.key])}
                    </td>
                    ))}
                    <td className="px-4 py-2">
                    <div className="flex gap-3">
                        {/* Update Action */}
                        <button
                        onClick={() =>
                            (window.location.href = `/dashboard/products/${row.id}/edit`)
                        }
                        className="text-indigo-400 hover:text-indigo-200"
                        >
                        <FaEdit />
                        </button>

                        {/* Delete Action */}
                        <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-400 hover:text-red-200"
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
