'use client';

import { useState, useEffect } from 'react';
import { X, Search, Calendar, Percent, FileText, AlertCircle, Pause } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { IProduct } from '@/models/products';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface SpecialOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface StoreData {
    _id: string;
    specialOffer?: {
        productId: string;
        offerTimeEnd: string;
        discount: number;
        description: string;
    };
}

export default function SpecialOfferModal({ isOpen, onClose, onSuccess }: SpecialOfferModalProps) {
    const { data: session } = useSession();
    const [products, setProducts] = useState<IProduct[]>([]);
    const [store, setStore] = useState<StoreData | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [discount, setDiscount] = useState<number>(0);
    const [description, setDescription] = useState<string>('');
    const [offerTimeEnd, setOfferTimeEnd] = useState<string>('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteAction, setDeleteAction] = useState<'reset' | 'pause' | 'remove' | null>(null);

    useEffect(() => {
        if (isOpen && session?.user?.id) {
            fetchStore();
            fetchProducts();
        }
    }, [isOpen, session]);

    useEffect(() => {
        if (store?.specialOffer) {
            setSelectedProductId(store.specialOffer.productId);
            setDiscount(store.specialOffer.discount);
            setDescription(store.specialOffer.description);
            const endDate = new Date(store.specialOffer.offerTimeEnd);
            setOfferTimeEnd(endDate.toISOString().slice(0, 16));
        }
    }, [store]);

    const fetchStore = async () => {
        try {
            const res = await fetch('/api/store/owner');
            if (!res.ok) throw new Error('Failed to fetch store');
            const data = await res.json();
            setStore(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load store data');
        }
    };

    const fetchProducts = async () => {
        try {
            const ownerId = session?.user?.id as string;
            const res = await fetch(`/api/products?owner=${ownerId}`);
            if (!res.ok) throw new Error('Failed to fetch products');
            const data = await res.json();
            setProducts(data.products || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load products');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !discount || !offerTimeEnd) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (discount < 0 || discount > 100) {
            toast.error('Discount must be between 0 and 100');
            return;
        }

        const endDate = new Date(offerTimeEnd);
        if (endDate <= new Date()) {
            toast.error('Offer end time must be in the future');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/store/owner', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updates: {
                        specialOffer: {
                            productId: selectedProductId,
                            offerTimeEnd: endDate.toISOString(),
                            discount,
                            description: description.trim(),
                        },
                    },
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update special offer');
            }

            toast.success('Special offer updated successfully');
            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Failed to update special offer');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/store/owner', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updates: {
                        specialOffer: null,
                    },
                }),
            });

            if (!res.ok) throw new Error('Failed to remove special offer');

            toast.success(getSuccessMessage());
            setSelectedProductId('');
            setDiscount(0);
            setDescription('');
            setOfferTimeEnd('');
            setShowDeleteConfirm(false);
            setDeleteAction(null);
            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Failed to remove special offer');
        } finally {
            setLoading(false);
        }
    };

    const getSuccessMessage = () => {
        switch (deleteAction) {
            case 'pause':
                return 'Special offer paused successfully';
            case 'reset':
                return 'Special offer reset successfully';
            case 'remove':
                return 'Special offer removed successfully';
            default:
                return 'Special offer updated successfully';
        }
    };

    const getDeleteDescription = () => {
        switch (deleteAction) {
            case 'pause':
                return 'Pausing will temporarily disable the special offer. You can resume it later with a new end time.';
            case 'reset':
                return 'Resetting will clear all special offer settings and remove it from your store.';
            case 'remove':
                return 'Removing will permanently delete the special offer from your store.';
            default:
                return 'Are you sure you want to proceed?';
        }
    };

    const openDeleteConfirm = (action: 'reset' | 'pause' | 'remove') => {
        setDeleteAction(action);
        setShowDeleteConfirm(true);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setDeleteAction(null);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Special Offer
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Product Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Product *
                            </label>
                            <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                />
                            </div>
                            <select
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            >
                                <option value="">Select a product...</option>
                                {filteredProducts.map((product) => (
                                    <option key={product._id} value={product._id}>
                                        {product.name} - ${product.price}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Discount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Percent className="w-4 h-4" />
                                Discount (%) *
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Special offer description..."
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Offer End Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Offer End Time *
                            </label>
                            <input
                                type="datetime-local"
                                value={offerTimeEnd}
                                onChange={(e) => setOfferTimeEnd(e.target.value)}
                                required
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {store?.specialOffer && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => openDeleteConfirm('pause')}
                                        disabled={loading}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Pause the offer temporarily"
                                    >
                                        <Pause className="w-4 h-4" />
                                        <span className="hidden sm:inline">Pause</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openDeleteConfirm('reset')}
                                        disabled={loading}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Reset the offer"
                                    >
                                        <X className="w-4 h-4" />
                                        <span className="hidden sm:inline">Reset</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openDeleteConfirm('remove')}
                                        disabled={loading}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Remove the offer permanently"
                                    >
                                        <X className="w-4 h-4" />
                                        <span className="hidden sm:inline">Remove</span>
                                    </button>
                                </>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save Offer'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>

            {/* Confirmation Dialog */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {deleteAction === 'pause' && 'Pause Special Offer?'}
                                        {deleteAction === 'reset' && 'Reset Special Offer?'}
                                        {deleteAction === 'remove' && 'Remove Special Offer?'}
                                    </h3>
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {getDeleteDescription()}
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={cancelDelete}
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRemove}
                                        disabled={loading}
                                        className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                            deleteAction === 'pause'
                                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                                : deleteAction === 'reset'
                                                    ? 'bg-orange-500 hover:bg-orange-600'
                                                    : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                    >
                                        {loading ? 'Processing...' : 'Confirm'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
}
