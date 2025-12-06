'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
    name: string;
    img: string;
}

interface CategoriesManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CategoriesManagementModal({ isOpen, onClose, onSuccess }: CategoriesManagementModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<Category>({ name: '', img: '' });

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/store/owner');
            if (!res.ok) throw new Error('Failed to fetch store');
            const data = await res.json();
            console.log('Fetched store data:', data);
            console.log('Categories:', data.categories);
            setCategories(data.categories || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
            toast.error('Failed to load categories');
        }
    };

    const handleAdd = () => {
        setEditingIndex(null);
        setFormData({ name: '', img: '' });
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setFormData(categories[index]);
    };

    const handleDelete = async (index: number) => {
        if (!confirm(`Are you sure you want to delete "${categories[index].name}"?`)) return;

        const updatedCategories = categories.filter((_, i) => i !== index);
        await saveCategories(updatedCategories);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        if (!formData.img.trim()) {
            toast.error('Category image URL is required');
            return;
        }

        let updatedCategories: Category[];
        if (editingIndex !== null) {
            // Update existing
            updatedCategories = categories.map((cat, i) =>
                i === editingIndex ? formData : cat
            );
        } else {
            // Add new
            if (categories.some(cat => cat.name.toLowerCase() === formData.name.toLowerCase())) {
                toast.error('Category with this name already exists');
                return;
            }
            updatedCategories = [...categories, formData];
        }

        await saveCategories(updatedCategories);
        setFormData({ name: '', img: '' });
        setEditingIndex(null);
    };

    const saveCategories = async (updatedCategories: Category[]) => {
        setLoading(true);
        try {
            const res = await fetch('/api/store/owner', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updates: {
                        categories: updatedCategories,
                    },
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update categories');
            }

            setCategories(updatedCategories);
            toast.success(editingIndex !== null ? 'Category updated successfully' : 'Category added successfully');
            onSuccess?.();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Failed to update categories');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Manage Categories
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Form Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {editingIndex !== null ? 'Edit Category' : 'Add Category'}
                                    </h3>
                                    {editingIndex !== null && (
                                        <button
                                            onClick={handleAdd}
                                            className="text-sm text-brand-blue hover:underline"
                                        >
                                            Add New
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Category Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="e.g., Electronics, Fashion"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" />
                                            Image URL *
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.img}
                                            onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                                            required
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                        />
                                        {formData.img && (
                                            <img
                                                src={formData.img}
                                                alt="Preview"
                                                className="mt-2 w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {loading
                                            ? 'Saving...'
                                            : editingIndex !== null
                                            ? 'Update Category'
                                            : 'Add Category'}
                                    </button>
                                </form>
                            </div>

                            {/* Categories List */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Categories ({categories.length})
                                </h3>
                                {categories.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <p>No categories yet. Add your first category!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                        <AnimatePresence>
                                            {categories.map((category, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                                >
                                                    <img
                                                        src={category.img}
                                                        alt={category.name}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64';
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                                            {category.name}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(index)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(index)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

