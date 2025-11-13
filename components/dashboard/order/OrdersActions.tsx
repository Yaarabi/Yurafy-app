'use client';

import { FaFileUpload, FaPlus, FaEllipsisV, FaFileDownload } from 'react-icons/fa';
import Papa from 'papaparse';
import { IOrder } from '@/models/orders';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import CSVExport from './CSVexport';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrdersActionsProps {
    orders: IOrder[];
    setOrders: React.Dispatch<React.SetStateAction<IOrder[]>>;
    setShowAddModal: (show: boolean) => void;
}

interface CSVRow {
    [key: string]: string | undefined;
}

// Mapping multilingual column names
const columnMap = {
    fullName: ['name', "full name", "customer", 'client', 'nom', 'nom complet', 'الاسم الكامل'],
    phone: ['phone', 'mobile', 'phonenumber', 'contact', 'telephone', 'tel', 'numéro', 'هاتف'],
    address: ['address', 'street', 'shippingaddress', 'adresse', 'rue', 'العنوان'],
    email: ['email', 'e-mail', 'mail', 'courriel', 'البريد الإلكتروني'],
    city: ['city', 'town', 'ville', 'المدينة'],
    country: ['country', 'nation', 'pays', 'البلد'],
    products: ['products', 'items', 'orderitems', 'produits', 'articles', 'المنتجات'],
    totalAmount: ['totalamount', 'total', 'amount', 'price', 'montant_total', 'prix', 'المجموع'],
    status: ['status', 'orderstatus', 'statut', 'etat', 'الحالة'],
};

// Status normalization according to schema
const normalizeStatus = (value?: string): IOrder['status'] => {
    if (!value) return 'new';
    const key = value.trim().toLowerCase();

    if (['new', 'nouveau', 'جديد'].includes(key)) return 'new';
    if (['processing', 'en traitement', 'قيد المعالجة', 'en cours', 'traitement'].includes(key)) return 'confirmed';
    if (['shipped', 'expédié', 'تم الشحن', 'envoyé'].includes(key)) return 'shipped';
    if (['delivered', 'livré', 'تم التسليم', 'livree'].includes(key)) return 'delivered';
    if (['cancelled', 'annulé', 'ملغى', 'annule'].includes(key)) return 'cancelled';

    console.warn(`Unknown status "${value}", defaulting to "new"`);
    return 'new';
};

// Optional: normalize product fields
const productMap: Record<string, string> = {
    // French -> English
    rouge: 'red', bleu: 'blue', vert: 'green', noir: 'black', blanc: 'white',
    petit: 'S', moyen: 'M', grand: 'L',
    // Arabic -> English
    أحمر: 'red', أزرق: 'blue', أخضر: 'green', أسود: 'black', أبيض: 'white',
    صغير: 'S', متوسط: 'M', كبير: 'L',
};

export default function OrdersActions({ orders, setOrders, setShowAddModal }: OrdersActionsProps) {
    const { data: session } = useSession();
    const [showCSVMenu, setShowCSVMenu] = useState(false);

    const getColumnValue = (row: CSVRow, possibleKeys: string[]) => {
        for (const key of possibleKeys) {
            const lowerKey = key.toLowerCase();
            if (row[lowerKey] !== undefined) return row[lowerKey];
        }
        return undefined;
    };

    const normalizeProductField = (value: string | undefined) => {
        if (!value) return value;
        const key = value.trim().toLowerCase();
        return productMap[key] || value;
    };

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse<CSVRow>(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.toLowerCase(),
            complete: async function (results) {
                const parsedOrders: Partial<IOrder>[] = results.data.map((row) => {
                    let products: IOrder['products'] = [];

                    const productsStr = getColumnValue(row, columnMap.products);
                    if (productsStr) {
                        try {
                            products = JSON.parse(productsStr).map((p: any) => ({
                                product: normalizeProductField(p.product),
                                quantity: Number(p.quantity) || 1,
                                price: Number(p.price) || 0,
                                color: normalizeProductField(p.color),
                                size: normalizeProductField(p.size),
                            }));
                        } catch (err) {
                            console.warn('Failed to parse products JSON for row:', row, err);
                            products = [];
                        }
                    }

                    return {
                        owner: session?.user?.id || '',
                        shippingAddress: {
                            fullName: getColumnValue(row, columnMap.fullName) || 'Empty',
                            phone: getColumnValue(row, columnMap.phone) || 'Empty',
                            address: getColumnValue(row, columnMap.address) || 'Empty',
                            email: getColumnValue(row, columnMap.email) || 'Empty',
                            city: getColumnValue(row, columnMap.city) || 'Empty',
                            country: getColumnValue(row, columnMap.country) || 'Empty',
                        },
                        products,
                        totalAmount: Number(getColumnValue(row, columnMap.totalAmount)) || 0,
                        status: normalizeStatus(getColumnValue(row, columnMap.status)),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                });

                try {
                    const res = await fetch('/api/orders/import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orders: parsedOrders }),
                    });

                    const data = await res.json();

                    if (res.ok) {
                        setOrders((prev) => [...prev, ...data.orders]);
                        toast.success(`✅ ${data.message || 'Orders uploaded successfully!'}`);
                    } else {
                        toast.error(`❌ ${data.error || 'Failed to upload orders'}`);
                    }
                } catch (err) {
                    console.error('CSV Upload Error:', err);
                    toast.error('⚠️ Server error while uploading orders');
                }
            },
        });
    };

    return (
        <div className="flex flex-wrap justify-end items-center gap-2 sm:gap-3">
            {/* Desktop View - Show all buttons */}
            <div className="hidden sm:flex items-center gap-3">
                {/* Upload CSV */}
                <label className="flex items-center justify-center gap-2 cursor-pointer bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm transition-all text-sm sm:text-base h-10">
                    <FaFileUpload className="w-4 h-4" />
                    <span>Upload CSV</span>
                    <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
                </label>

                {/* Export CSV */}
                <CSVExport
                    orders={orders}
                    icon={<FaFileDownload className="w-4 h-4" />}
                    text="Export CSV"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 dark:from-green-600 dark:to-green-500 dark:hover:from-green-500 dark:hover:to-green-400 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all text-sm sm:text-base font-medium h-10"
                />
            </div>

            {/* Mobile View - CSV Menu Button */}
            <div className="relative sm:hidden">
                <button
                    onClick={() => setShowCSVMenu(!showCSVMenu)}
                    className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm transition-all"
                    aria-label="CSV actions"
                >
                    <FaEllipsisV className="w-4 h-4" />
                </button>

                {/* CSV Dropdown Menu */}
                <AnimatePresence>
                    {showCSVMenu && (
                        <>
                            {/* Backdrop */}
                            <div 
                                className="fixed inset-0 z-40"
                                onClick={() => setShowCSVMenu(false)}
                            />
                            
                            {/* Menu */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50"
                            >
                                {/* Upload CSV */}
                                <label className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                    <FaFileUpload className="w-4 h-4 text-[var(--brand-blue)]" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Upload CSV</span>
                                    <input 
                                        type="file" 
                                        accept=".csv" 
                                        className="hidden" 
                                        onChange={(e) => {
                                            handleCSVUpload(e);
                                            setShowCSVMenu(false);
                                        }} 
                                    />
                                </label>

                                {/* Export CSV */}
                                <div onClick={() => setShowCSVMenu(false)}>
                                    <CSVExport
                                        orders={orders}
                                        icon={<FaFileDownload className="w-4 h-4 text-green-600 dark:text-green-500" />}
                                        text="Export CSV"
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200"
                                    />
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Add Order Button - Always visible */}
            <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 text-white px-3 sm:px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md text-sm sm:text-base font-medium h-10"
            >
                <FaPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Order</span>
                <span className="sm:hidden">Add</span>
            </button>
        </div>
    );
}
