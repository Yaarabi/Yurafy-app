'use client';

import { IOrder } from '@/models/orders';
import React, { ReactNode } from 'react';
import { FaFileDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface CSVExportProps {
    orders: IOrder[]; 
    fileName?: string;
    icon?: ReactNode;
    text?: string;
    className?: string;
}

export default function CSVExport({
    orders,
    fileName = 'orders.csv',
    icon,
    text = 'Export CSV',
    className = '',
}: CSVExportProps) {
    const exportCSV = () => {
        if (!orders.length) {
            toast.error('No orders selected for export');
            return;
        }

        // CSV header
        const header = [
            'ID',
            'Customer',
            'Phone',
            'Address',
            'Products',
            'Total',
            'Status',
            'Date',
        ];

        // CSV rows
        const rows = orders.map((o) => [
            o._id,
            o.shippingAddress.fullName,
            o.shippingAddress.phone || '',
            o.shippingAddress.address,
            o.products
                .map((p) => `${p.product} (${p.color || ''}/${p.size || ''}) x${p.quantity}`)
                .join(' | '),
            o.totalAmount,
            o.status,
            new Date(o.createdAt).toLocaleDateString(),
        ]);

        const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', fileName);
        link.click();
    };

    return (
        <button
            onClick={exportCSV}
            className={className || `flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md transition h-10`}
        >
            {icon || <FaFileDownload className="w-4 h-4" />}
            <span>{text}</span>
        </button>
    );
}
