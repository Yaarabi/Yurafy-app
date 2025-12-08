'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IProduct } from '@/models/store/products';
import { Trash2, Plus } from 'lucide-react';

interface SpecificationsProps {
    values: Partial<IProduct>;
    setValues: (values: React.SetStateAction<Partial<IProduct>>) => void;
    Input: (props: any) => React.JSX.Element;
}

export default function Specifications({ values, setValues, Input }: SpecificationsProps) {
    const t = useTranslations('products.form');
    const [showSpecifications, setShowSpecifications] = useState(false);
    const [currentSpec, setCurrentSpec] = useState({ title: '', description: '' });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const specifications = values.specifications || [];

    const handleAddSpec = () => {
        if (!currentSpec.title.trim() || !currentSpec.description.trim()) {
            return;
        }

        if (editingIndex !== null) {
            // Update existing specification
            const updated = [...specifications];
            updated[editingIndex] = currentSpec;
            setValues((prev) => ({ ...prev, specifications: updated }));
            setEditingIndex(null);
        } else {
            // Add new specification
            setValues((prev) => ({
                ...prev,
                specifications: [...(prev.specifications || []), currentSpec]
            }));
        }

        setCurrentSpec({ title: '', description: '' });
    };

    const handleEditSpec = (index: number) => {
        setCurrentSpec(specifications[index]);
        setEditingIndex(index);
    };

    const handleDeleteSpec = (index: number) => {
        setValues((prev) => ({
            ...prev,
            specifications: (prev.specifications || []).filter((_, i) => i !== index)
        }));
    };

    const handleCancelEdit = () => {
        setCurrentSpec({ title: '', description: '' });
        setEditingIndex(null);
    };

    return (
        <div className="mt-6 border-t pt-6">
            <button
                type="button"
                onClick={() => setShowSpecifications((prev) => !prev)}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
            >
                {showSpecifications ? t('hideSpecifications') : t('manageSpecifications')}
            </button>

            {showSpecifications && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    {/* Add/Edit Specification Form */}
                    <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                            {editingIndex !== null ? t('editSpecification') : t('addSpecification')}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder={t('specTitle')}
                                value={currentSpec.title}
                                onChange={(e) => setCurrentSpec((prev) => ({ ...prev, title: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder={t('specDescription')}
                                value={currentSpec.description}
                                onChange={(e) => setCurrentSpec((prev) => ({ ...prev, description: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleAddSpec}
                                disabled={!currentSpec.title.trim() || !currentSpec.description.trim()}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                {editingIndex !== null ? t('update') : t('add')}
                            </button>
                            {editingIndex !== null && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
                                >
                                    {t('cancel')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Specifications List */}
                    {specifications.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('addedSpecifications')} ({specifications.length})
                            </h4>
                            {specifications.map((spec, index) => (
                                <div
                                    key={index}
                                    className="flex items-start justify-between gap-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                            {spec.title}
                                        </h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                            {spec.description}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleEditSpec(index)}
                                            className="px-3 py-1 text-xs bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-800 dark:text-amber-100 rounded-md transition-colors"
                                        >
                                            {t('edit')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteSpec(index)}
                                            className="p-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-200 rounded-md transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {specifications.length === 0 && (
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                            {t('noSpecifications')}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
