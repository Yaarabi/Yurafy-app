'use client';
import { useState } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { IOrder } from '@/models/store/orders';
import { normalizePhoneNumber } from '@/lib/utils/phoneUtils';

interface ProductItem {
    product?: string; // optional
    name: string;     // required
    quantity: number;
    price: number;
    color?: string;
    size?: string;
}

interface UpdateOrderModalProps {
    show: boolean;
    order: IOrder;
    onClose: () => void;
    onUpdateOrder: (order: IOrder) => void;
}

export default function UpdateOrderModal({
    show,
    order,
    onClose,
    onUpdateOrder,
}: UpdateOrderModalProps) {
    const [fullName, setFullName] = useState(order.shippingAddress.fullName);
    const [phone, setPhone] = useState(order.shippingAddress.phone);
    const [address, setAddress] = useState(order.shippingAddress.address);
    const [products, setProducts] = useState<ProductItem[]>(order.products);
    const [status, setStatus] = useState<IOrder['status']>(order.status);
    const [totalAmount, setTotalAmount] = useState(order.totalAmount);
    const [loading, setLoading] = useState(false);

    if (!show) return null;

    const addProduct = () =>
        setProducts([...products, { product: undefined, name: '', quantity: 1, price: 0 }]);

    const updateProduct = (
        index: number,
        field: keyof ProductItem,
        value: string | number
    ) => {
        const updated = [...products];
        const product = { ...updated[index] };
        if (field === 'quantity' || field === 'price') {
            product[field] = Number(value);
        } else {
            product[field] = String(value);
        }
        updated[index] = product;
        setProducts(updated);

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

    const handleUpdate = async () => {
        if (loading) return;
        setLoading(true);
        // Validate phone number - must be more than just country code
        const phoneDigits = phone.replace(/\D/g, ''); // Remove all non-digits
        if (!phone || phone.trim() === '' || phoneDigits.length < 10) {
            toast.error('Phone number is required. Please enter a complete phone number (not just country code).');
            setLoading(false);
            return;
        }

        if (!fullName || !address || products.length === 0) {
            toast.error('Please fill all required fields and add at least one product.');
            setLoading(false);
            return;
        }

        // Validate product names
        const missingName = products.find(p => !p.name || p.name.trim() === '');
        if (missingName) {
            toast.error('Please provide a name for all products.');
            setLoading(false);
            return;
        }

        // Normalize phone number to E.164 format before sending
        const normalizedPhone = normalizePhoneNumber(phone);

        const updatedOrder: Partial<IOrder> = {
            shippingAddress: { fullName, phone: normalizedPhone, address },
            products, 
            totalAmount,
            status,
        };
        console.log({
            shippingAddress: { fullName, phone, address },
            products, 
            totalAmount,
            status,
        })
        try {
            const res = await fetch(`/api/orders?id=${order._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedOrder),
            });

            const data = await res.json();

            if (res.ok) {
                // WhatsApp trigger logic (frontend)
                const waRes = await fetch('/api/whatsapp/trigger/manually', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: data.order._id, owner: data.order.owner })
                });
                const waData = await waRes.json();
                if (!waRes.ok || waData.error) {
                    toast.error(waData.error || 'WhatsApp trigger failed');
                } else if (waData.confirmationRequired) {
                    if (window.confirm(waData.message || 'Do you want to send the WhatsApp template?')) {
                        const waConfirmRes = await fetch('/api/whatsapp/trigger/manually', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderId: data.order._id, owner: data.order.owner, confirmed: true })
                        });
                        const waConfirmData = await waConfirmRes.json();
                        if (!waConfirmRes.ok || waConfirmData.error) {
                            toast.error(waConfirmData.error || 'WhatsApp trigger failed');
                        }
                    }
                }
                onUpdateOrder(data.order);
                toast.success('Order updated successfully!');
                onClose();
            } else {
                toast.error(data.error?.message || data.error || 'Failed to update order');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || 'Server error while updating order');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-4 sm:pt-10 md:pt-20 z-50 overflow-auto p-2 sm:p-4">
            <div className="bg-gray-800 text-gray-200 rounded-lg p-4 sm:p-6 w-full max-w-3xl relative shadow-lg mb-4">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-200 p-1"
                >
                    <FaTimes className="w-5 h-5" />
                </button>

                <h2 className="text-lg sm:text-xl font-semibold mb-4 pr-8">Update Order</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <input
                        className="p-2 rounded bg-gray-700 border border-gray-600"
                        placeholder="Full Name *"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                    <input
                        className="p-2 rounded bg-gray-700 border border-gray-600"
                        placeholder="Phone *"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                    <input
                        className="p-2 rounded bg-gray-700 border border-gray-600"
                        placeholder="Address *"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Products</span>
                        <button
                            onClick={addProduct}
                            className="flex items-center gap-1 px-3 py-1 rounded bg-[var(--brand-blue)] hover:opacity-90 transition text-white"
                        >
                            <FaPlus /> Add Product
                        </button>
                    </div>

                    {products.map((p, i) => (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 mb-2 items-start">
                            <input
                                className="p-2 rounded bg-gray-700 border border-gray-600 text-sm"
                                placeholder="Product ID"
                                value={p.product || ''}
                                onChange={(e) => updateProduct(i, 'product', e.target.value)}
                            />
                            <input
                                className="p-2 rounded bg-gray-700 border border-gray-600 text-sm sm:col-span-2"
                                placeholder="Product Name *"
                                value={p.name}
                                onChange={(e) => updateProduct(i, 'name', e.target.value)}
                            />
                            <input
                                type="text"
                                className="p-2 rounded bg-gray-700 border border-gray-600 text-sm"
                                placeholder="Quantity (e.g., 1, 2, 5)"
                                value={p.quantity}
                                onChange={(e) => updateProduct(i, 'quantity', Number(e.target.value) || 0)}
                            />
                            <input
                                type="text"
                                className="p-2 rounded bg-gray-700 border border-gray-600 text-sm"
                                placeholder="Price (e.g., 99.99)"
                                value={p.price}
                                onChange={(e) => updateProduct(i, 'price', Number(e.target.value) || 0)}
                            />
                            <input
                                className="p-2 rounded bg-gray-700 border border-gray-600 text-sm"
                                placeholder="Color"
                                value={p.color || ''}
                                onChange={(e) => updateProduct(i, 'color', e.target.value)}
                            />
                            <input
                                className="p-2 rounded bg-gray-700 border border-gray-600 text-sm"
                                placeholder="Size"
                                value={p.size || ''}
                                onChange={(e) => updateProduct(i, 'size', e.target.value)}
                            />
                            <button
                                onClick={() => removeProduct(i)}
                                className="text-red-500 hover:text-red-400 p-2 flex items-center justify-center"
                            >
                                <FaTrash className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <input
                        type="text"
                        className="p-2 rounded bg-gray-700 border border-gray-600 text-sm"
                        placeholder="Total Amount (e.g., 199.99)"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
                    />
                    <select
                        className="p-2 rounded bg-gray-700 border border-gray-600 text-sm"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as IOrder['status'])}
                    >
                        <option value="new">New</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition text-sm sm:text-base"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className={`px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-500 text-white transition text-sm sm:text-base flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>Loading...</span> : 'Update Order'}
                    </button>
                </div>
            </div>
        </div>
    );
}
