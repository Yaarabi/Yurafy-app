'use client';

import { useState } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { IOrder } from '@/models/orders';

interface ProductItem {
    product?: string; // Product ID (optional)
    name: string;     // Product name (required)
    quantity: number;
    price: number;
    color?: string;
    size?: string;
}

interface AddOrderModalProps {
    show: boolean;
    onClose: () => void;
    onAddOrder: (order: IOrder) => void;
}

export default function AddOrderModal({ show, onClose, onAddOrder }: AddOrderModalProps) {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [status, setStatus] = useState<IOrder['status']>('new');
    const [totalAmount, setTotalAmount] = useState<number>(0);

    if (!show) return null;

    const addProduct = () =>
        setProducts([...products, { product: undefined, name: '', quantity: 1, price: 0 }]);

    const updateProduct = (index: number, field: keyof ProductItem, value: string | number) => {
        const updated = [...products];
        (updated[index] as any)[field] = 
            field === 'quantity' || field === 'price' ? Number(value) : String(value);
        setProducts(updated);

        // Update total
        const total = updated.reduce((sum, p) => sum + p.price * p.quantity, 0);
        setTotalAmount(total);
    };

    const removeProduct = (index: number) => {
        const updated = [...products];
        updated.splice(index, 1);
        setProducts(updated);
        const total = updated.reduce((sum, p) => sum + p.price * p.quantity, 0);
        setTotalAmount(total);
    };

    const handleSubmit = async () => {
        // Validate phone number - must be more than just country code
        const phoneDigits = phone.replace(/\D/g, ''); // Remove all non-digits
        if (!phone || phone.trim() === '' || phoneDigits.length < 10) {
            toast.error('Phone number is required. Please enter a complete phone number (not just country code).');
            return;
        }

        if (!fullName || !address || products.length === 0 || products.some(p => !p.name)) {
            toast.error('Please fill all required fields and add at least one product with a name.');
            return;
        }

        const newOrder: Partial<IOrder> = {
            shippingAddress: { fullName, phone, address },
            products,
            totalAmount,
            status,
            createdAt: new Date(),
            updatedAt: new Date(),
            owner: '', // backend will populate
        };

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder),
            });

            const data = await res.json();

            if (res.ok) {
                onAddOrder(data.order);
                toast.success('Order added successfully!');
                onClose();
                setFullName(''); setPhone(''); setAddress('');
                setProducts([]); setStatus('new'); setTotalAmount(0);
            } else {
                toast.error(data.error?.message || data.error || 'Failed to add order');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || 'Server error while adding order');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50 overflow-auto">
            <div className="bg-gray-800 text-gray-200 rounded-lg p-6 w-full max-w-3xl relative shadow-lg">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"><FaTimes /></button>
                <h2 className="text-xl font-semibold mb-4">Add New Order</h2>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input className="p-2 rounded bg-gray-700 border border-gray-600" placeholder="Full Name *" value={fullName} onChange={e => setFullName(e.target.value)} required />
                    <input className="p-2 rounded bg-gray-700 border border-gray-600" placeholder="Phone *" value={phone} onChange={e => setPhone(e.target.value)} required />
                    <input className="p-2 rounded bg-gray-700 border border-gray-600" placeholder="Address *" value={address} onChange={e => setAddress(e.target.value)} required />
                </div>

                {/* Products */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Products</span>
                        <button onClick={addProduct} className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 transition"><FaPlus /> Add Product</button>
                    </div>

                    {products.map((p, i) => (
                        <div key={i} className="flex gap-2 mb-2 items-center flex-wrap">
                            <input className="p-2 rounded bg-gray-700 border border-gray-600 w-32" placeholder="Product ID" value={p.product || ''} onChange={e => updateProduct(i, 'product', e.target.value)} />
                            <input className="p-2 rounded bg-gray-700 border border-gray-600 flex-1" placeholder="Product Name" value={p.name} onChange={e => updateProduct(i, 'name', e.target.value)} />
                            <input type="number" className="p-2 rounded bg-gray-700 border border-gray-600 w-20" placeholder="Qty" value={p.quantity} min={1} onChange={e => updateProduct(i, 'quantity', Number(e.target.value))} />
                            <input type="number" className="p-2 rounded bg-gray-700 border border-gray-600 w-24" placeholder="Price" value={p.price} min={0} onChange={e => updateProduct(i, 'price', Number(e.target.value))} />
                            <input className="p-2 rounded bg-gray-700 border border-gray-600 w-24" placeholder="Color" value={p.color || ''} onChange={e => updateProduct(i, 'color', e.target.value)} />
                            <input className="p-2 rounded bg-gray-700 border border-gray-600 w-24" placeholder="Size" value={p.size || ''} onChange={e => updateProduct(i, 'size', e.target.value)} />
                            <button onClick={() => removeProduct(i)} className="text-red-500 hover:text-red-400"><FaTrash /></button>
                        </div>
                    ))}
                </div>

                {/* Total & Status */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <input type="number" className="p-2 rounded bg-gray-700 border border-gray-600" placeholder="Total Amount" value={totalAmount} onChange={e => setTotalAmount(Number(e.target.value))} />
                    <select className="p-2 rounded bg-gray-700 border border-gray-600" value={status} onChange={e => setStatus(e.target.value as IOrder['status'])}>
                        <option value="new">New</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white transition">Add Order</button>
                </div>
            </div>
        </div>
    );
}
