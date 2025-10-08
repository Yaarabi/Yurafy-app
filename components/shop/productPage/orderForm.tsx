
'use client';
import { useState } from 'react';
import { IProduct } from '@/models/products';

export default function OrderForm({ product }: { product: IProduct }) {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        quantity: 1,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const orderData = {
        owner: product.owner, // or current user if logged in
        products: [
            {
            product: product._id,
            quantity: form.quantity,
            price: product.price,
            },
        ],
        totalAmount: product.price * Number(form.quantity),
        shippingAddress: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            country: form.country,
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
            email: '',
            phone: '',
            address: '',
            city: '',
            country: '',
            quantity: 1,
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
            className="w-full border rounded-lg px-4 py-2"
        />
        <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2"
        />
        <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
        />
        <input
            type="text"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2"
        />
        <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2"
        />
        <input
            type="text"
            name="country"
            placeholder="Country"
            value={form.country}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2"
        />

        <input
            type="number"
            name="quantity"
            min={1}
            value={form.quantity}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
        />

        <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
            Submit Order
        </button>
        </form>
    );
}
