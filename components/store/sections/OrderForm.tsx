
import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import type { IOrder } from '../types';

const OrderForm: React.FC = () => {
    const { selectedProduct, productOptions } = useStore();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
    });
    const [submissionState, setSubmissionState] = useState<{ status: 'idle' | 'submitting' | 'success' | 'error', message: string }>({ status: 'idle', message: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName || !formData.phone || !formData.address) {
            setSubmissionState({ status: 'error', message: 'Full Name, Phone, and Address are required.' });
            return;
        }

        if (!selectedProduct) {
            setSubmissionState({ status: 'error', message: 'Product information is missing.' });
            return;
        }
        
        setSubmissionState({ status: 'submitting', message: '' });

        const orderData = {
            owner: selectedProduct.owner,
            products: [
                {
                    product: selectedProduct._id,
                    name: selectedProduct.name,
                    quantity: productOptions.quantity,
                    price: selectedProduct.price,
                    color: productOptions.color,
                    size: productOptions.size,
                },
            ],
            totalAmount: selectedProduct.price * productOptions.quantity,
            shippingAddress: {
                fullName: formData.fullName,
                phone: formData.phone,
                address: formData.address,
            },
        };

        // In a real app, you'd replace this with your actual API endpoint base URL
        const url = ''; 

        try {
            const res = await fetch(`${url}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            
            // This is a mock response since we don't have a live API
            // In a real scenario, you'd check res.ok
            const mockSuccess = true; 

            if (mockSuccess) { // Replace with res.ok
                setSubmissionState({ status: 'success', message: 'Order submitted successfully ✅' });
                setFormData({
                    fullName: '',
                    phone: '',
                    address: '',
                });
                 console.log('Simulating order submission:', orderData);
            } else {
                setSubmissionState({ status: 'error', message: 'An error occurred, please try again.' });
            }
        } catch (error) {
            setSubmissionState({ status: 'error', message: 'Network error, please try again.' });
        }
    };
    
    if (submissionState.status === 'success') {
        return (
            <div className="text-center p-8 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                <h3 className="text-xl font-bold text-green-800">Thank You!</h3>
                <p className="text-green-700 mt-2">Your order has been placed successfully. We will contact you shortly to confirm.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Cash on Delivery Order</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                        placeholder="555-123-4567"
                    />
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Full Address</label>
                    <textarea
                        name="address"
                        id="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                        placeholder="123 Main St, Anytown, USA 12345"
                    />
                </div>
                {submissionState.status === 'error' && <p className="text-sm text-red-600">{submissionState.message}</p>}
                <div>
                    <button
                        type="submit"
                        disabled={submissionState.status === 'submitting'}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submissionState.status === 'submitting' ? 'Placing Order...' : 'Place Order'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OrderForm;