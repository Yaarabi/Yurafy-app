'use client';

import { FaFileUpload, FaPlus } from 'react-icons/fa';
import Papa from 'papaparse';
import { IOrder } from '@/models/orders';
import { useSession } from 'next-auth/react';

interface OrdersActionsProps {
    orders: IOrder[];
    setOrders: React.Dispatch<React.SetStateAction<IOrder[]>>;
    setShowAddModal: (show: boolean) => void;
}

interface CSVRow {
    fullName?: string;
    phone?: string;
    address?: string;
    email?: string;
    city?: string;
    country?: string;
    products?: string; // JSON string
    totalAmount?: string | number;
    status?: string;
}

export default function OrdersActions({ orders, setOrders, setShowAddModal }: OrdersActionsProps) {
    const { data: session } = useSession();

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse<CSVRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: async function (results) {
            const parsedOrders: Partial<IOrder>[] = results.data.map((row) => {
            let products: IOrder['products'] = [];

            // Safe JSON parse for products
            if (row.products) {
                try {
                products = JSON.parse(row.products).map((p: any) => ({
                    product: p.product,
                    quantity: Number(p.quantity) || 1,
                    price: Number(p.price) || 0,
                    color: p.color,
                    size: p.size,
                }));
                } catch (err) {
                console.warn('Failed to parse products JSON for row:', row, err);
                products = [];
                }
            }

            return {
                owner: session?.user?.id || '', // must be string
                shippingAddress: {
                fullName: row.fullName || '',
                phone: row.phone || '',
                address: row.address || '',
                email: row.email || '',
                city: row.city || '',
                country: row.country || '',
                },
                products,
                totalAmount: Number(row.totalAmount) || 0,
                status: (row.status as IOrder['status']) || 'new',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            });

            try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orders: parsedOrders }),
            });

            if (res.ok) {
                const data = await res.json();
                setOrders((prev) => [...prev, ...data.orders]);
                alert('Orders uploaded successfully!');
            } else {
                const errorData = await res.json();
                console.error('CSV Upload failed:', errorData);
                alert('Failed to upload orders');
            }
            } catch (err) {
            console.error('CSV Upload Error:', err);
            alert('Server error while uploading orders');
            }
        },
        });
    };

    return (
        <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <label className="flex items-center gap-2 cursor-pointer bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded transition">
            <FaFileUpload />
            Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
        </label>

        <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition"
        >
            <FaPlus />
            Add Order
        </button>
        </div>
    );
}
