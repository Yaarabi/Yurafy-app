'use client';
import { useState } from 'react';
import { IProduct } from '@/models/products';

export default function OrderForm({ product }: { product: IProduct }) {
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        quantity: 1,
        color: '',
        size: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const increment = () => setForm((prev) => ({ ...prev, quantity: prev.quantity + 1 }));
    const decrement = () =>
        setForm((prev) => ({ ...prev, quantity: prev.quantity > 1 ? prev.quantity - 1 : 1 }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const orderData = {
            owner: product.owner,
            products: [
                {
                    product: product._id,
                    quantity: form.quantity,
                    price: product.price,
                    color: form.color,
                    size: form.size,
                },
            ],
            totalAmount: product.price * form.quantity,
            shippingAddress: {
                fullName: form.fullName,
                phone: form.phone,
                address: form.address,
            },
        };
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });

        if (res.ok) {
            alert('Order submitted successfully!');
            setForm({
                fullName: '',
                phone: '',
                address: '',
                quantity: 1,
                color: '',
                size: '',
            });
        } else {
            alert('Something went wrong. Please try again.');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-10 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md space-y-4"
        >
            <h3 className="text-xl font-bold text-gray-800">Place Your Order</h3>

            <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <input
                type="text"
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />

            {/* Color Select */}
            {Array.isArray(product.colors) && product.colors.length > 0 && (
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Color</label>
                    <select
                        name="color"
                        value={form.color}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
                        required
                    >
                        <option value="">Select Color</option>
                        {product.colors.map((color, idx) => (
                            <option key={idx} value={color}>
                                {color}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Size Select */}
            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Size</label>
                    <select
                        name="size"
                        value={form.size}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
                        required
                    >
                        <option value="">Select Size</option>
                        {product.sizes.map((size, idx) => (
                            <option key={idx} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex w-full items-center gap-4">
                <span className="text-gray-700 font-medium">Quantity:</span>
                <button
                    type="button"
                    onClick={decrement}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                >
                    −
                </button>
                <span className="px-4 py-1 bg-gray-100 border rounded-md">{form.quantity}</span>
                <button
                    type="button"
                    onClick={increment}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                >
                    +
                </button>
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
                Submit Order
            </button>
        </form>
    );
}
