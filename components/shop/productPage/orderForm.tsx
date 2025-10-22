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
        <form
        onSubmit={handleSubmit}
        id="order-form"
        className="mt-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-md space-y-4"
        style={{ fontFamily: 'var(--font-family, Inter)' }}
        >
        <h3
            className="text-xl font-bold"
            style={{
            color: 'var(--text-color)',
            fontWeight: 'var(--heading-weight, 700)',
            }}
        >
            Passer votre commande
        </h3>

        <input
            type="text"
            name="fullName"
            placeholder="Nom complet"
            value={form.fullName}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
        />

        <input
            type="tel"
            inputMode="numeric"
            name="phone"
            placeholder="Numéro de téléphone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
        />

        <input
            type="text"
            name="address"
            placeholder="Adresse"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
        />

        {Array.isArray(product.colors) && product.colors.length > 0 && (
            <div>
            <label className="block font-medium mb-1" style={{ color: 'var(--text-color)' }}>
                Couleur
            </label>
            <select
                name="color"
                value={form.color}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                required
            >
                <option value="">Sélectionner une couleur</option>
                {product.colors.map((color, idx) => (
                <option key={idx} value={color}>
                    {color}
                </option>
                ))}
            </select>
            </div>
        )}

        {Array.isArray(product.sizes) && product.sizes.length > 0 && (
            <div>
            <label className="block font-medium mb-1" style={{ color: 'var(--text-color)' }}>
                Taille
            </label>
            <select
                name="size"
                value={form.size}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                required
            >
                <option value="">Sélectionner une taille</option>
                {product.sizes.map((size, idx) => (
                <option key={idx} value={size}>
                    {size}
                </option>
                ))}
            </select>
            </div>
        )}

        <div className="flex items-center gap-4 mt-2">
            <span className="font-medium" style={{ color: 'var(--text-color)' }}>
            Quantité :
            </span>
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
            className="w-full py-3 rounded-lg transition font-medium mt-4"
            style={{
            backgroundColor: 'var(--button-color)',
            color: 'white',
            }}
        >
            Commander maintenant
        </button>
        </form>
    );
}
