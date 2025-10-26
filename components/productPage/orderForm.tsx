'use client';

import { useState } from 'react';
import { IProduct } from '@/models/products';
import toast from 'react-hot-toast';

export default function OrderForm({ product }: { product: IProduct }) {
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        quantity: 1,
        color: '',
        size: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const increment = () => setForm(prev => ({ ...prev, quantity: prev.quantity + 1 }));
    const decrement = () => setForm(prev => ({ ...prev, quantity: prev.quantity > 1 ? prev.quantity - 1 : 1 }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const orderData = {
        owner: product.owner,
        products: [{ product: product._id, quantity: form.quantity, price: product.price, color: form.color, size: form.size }],
        totalAmount: product.price * form.quantity,
        shippingAddress: { fullName: form.fullName, phone: form.phone, address: form.address },
        };

        try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });

        if (res.ok) {
            toast.success('Commande envoyée avec succès ✅');
            setForm({ fullName: '', phone: '', address: '', quantity: 1, color: '', size: '' });
        } else {
            toast.error('Une erreur est survenue, réessayez.');
        }
        } catch (error) {
        toast.error('Erreur réseau, veuillez réessayer.');
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg p-6 mt-8 bg-gray-50 max-w-2xl mx-auto">
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--secondary-color)' }}>
            Passer votre commande
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
            type="text"
            name="fullName"
            placeholder="Nom complet"
            value={form.fullName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
            />

            <input
            type="tel"
            name="phone"
            placeholder="Numéro de téléphone"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
            />

            <textarea
            name="address"
            placeholder="Adresse"
            value={form.address}
            onChange={handleChange}
            rows={3}
            required
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
            />

            {product.colors && product.colors?.length > 0 && (
            <select
                name="color"
                value={form.color}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
            >
                <option value="">Sélectionner une couleur</option>
                {product.colors.map((color, idx) => (
                <option key={idx} value={color}>{color}</option>
                ))}
            </select>
            )}

            {product.sizes && product.sizes?.length > 0 && (
            <select
                name="size"
                value={form.size}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
            >
                <option value="">Sélectionner une taille</option>
                {product.sizes.map((size, idx) => (
                <option key={idx} value={size}>{size}</option>
                ))}
            </select>
            )}

            <div className="flex items-center gap-4 mt-2">
            <span className="font-semibold">Quantité :</span>
            <button type="button" onClick={decrement} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">−</button>
            <span className="px-4 py-1 bg-gray-100 border rounded-md">{form.quantity}</span>
            <button type="button" onClick={increment} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">+</button>
            </div>

            <button
            type="submit"
            className="w-full py-3 rounded-lg font-bold text-lg transition-transform duration-300 ease-in-out transform hover:scale-105"
            style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}
            >
            Commander maintenant
            </button>
        </form>
        </div>
    );
    }
