'use client';
import { useState } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { IOrder } from '@/models/orders';

interface ProductItem {
    product: string;
    quantity: number;
    price: number; 
    color?: string;
    size?: string;
}

interface AddOrderModalProps {
    show: boolean;
    onClose: () => void;
    onAddOrder: (order: IOrder) => void; // type-safe
}

export default function AddOrderModal({ show, onClose, onAddOrder }: AddOrderModalProps) {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [status, setStatus] = useState<IOrder['status']>('new');
    const [totalAmount, setTotalAmount] = useState<number>(0);

    // Add a new product with default values
    const addProduct = () =>
        setProducts([...products, { product: '', quantity: 1, price: 0 }]);

    // Update product field safely
    const updateProduct = (
        index: number,
        field: keyof ProductItem,
        value: string | number
    ) => {
        const updated = [...products];
        if (field === 'quantity' || field === 'price') {
        updated[index][field] = Number(value);
        } else {
        updated[index][field] = String(value);
        }
        setProducts(updated);
    };

    // Remove a product
    const removeProduct = (index: number) => {
        const updated = [...products];
        updated.splice(index, 1);
        setProducts(updated);
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!fullName || !address || products.length === 0) {
        alert('Please fill all required fields and add at least one product.');
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

        if (res.ok) {
            const data = await res.json();
            onAddOrder(data.order);
            onClose();
            // reset form
            setFullName('');
            setPhone('');
            setAddress('');
            setProducts([]);
            setStatus('new');
            setTotalAmount(0);
        } else {
            alert('Failed to add order');
        }
        } catch (err) {
        console.error(err);
        alert('Server error');
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50 overflow-auto">
        <div className="bg-gray-800 text-gray-200 rounded-lg p-6 w-full max-w-3xl relative shadow-lg">
            {/* Close Button */}
            <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
            >
            <FaTimes />
            </button>

            <h2 className="text-xl font-semibold mb-4">Add New Order</h2>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
                className="p-2 rounded bg-gray-700 border border-gray-600"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
            />
            <input
                className="p-2 rounded bg-gray-700 border border-gray-600"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            <input
                className="p-2 rounded bg-gray-700 border border-gray-600"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            </div>

            {/* Products */}
            <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Products</span>
                <button
                onClick={addProduct}
                className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 transition"
                >
                <FaPlus /> Add Product
                </button>
            </div>

            {products.map((p, i) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                <input
                    className="p-2 rounded bg-gray-700 border border-gray-600 flex-1"
                    placeholder="Product Name"
                    value={p.product}
                    onChange={(e) => updateProduct(i, 'product', e.target.value)}
                />
                <input
                    type="number"
                    className="p-2 rounded bg-gray-700 border border-gray-600 w-20"
                    placeholder="Qty"
                    value={p.quantity}
                    min={1}
                    onChange={(e) => updateProduct(i, 'quantity', Number(e.target.value))}
                />
                <input
                    type="number"
                    className="p-2 rounded bg-gray-700 border border-gray-600 w-20"
                    placeholder="Price"
                    value={p.price}
                    min={0}
                    onChange={(e) => updateProduct(i, 'price', Number(e.target.value))}
                />
                <input
                    className="p-2 rounded bg-gray-700 border border-gray-600 w-20"
                    placeholder="Color"
                    value={p.color || ''}
                    onChange={(e) => updateProduct(i, 'color', e.target.value)}
                />
                <input
                    className="p-2 rounded bg-gray-700 border border-gray-600 w-20"
                    placeholder="Size"
                    value={p.size || ''}
                    onChange={(e) => updateProduct(i, 'size', e.target.value)}
                />
                <button
                    onClick={() => removeProduct(i)}
                    className="text-red-500 hover:text-red-400"
                >
                    <FaTrash />
                </button>
                </div>
            ))}
            </div>

            {/* Total and Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <input
                type="number"
                className="p-2 rounded bg-gray-700 border border-gray-600"
                placeholder="Total Amount"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
            />
            <select
                className="p-2 rounded bg-gray-700 border border-gray-600"
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

            <div className="flex justify-end gap-3">
            <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition"
            >
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white transition"
            >
                Add Order
            </button>
            </div>
        </div>
        </div>
    );
}
