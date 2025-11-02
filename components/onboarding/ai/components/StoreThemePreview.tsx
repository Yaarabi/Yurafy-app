'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye } from 'lucide-react';
import { StoreProvider } from '@/components/store/context/StoreContext';
import ThemeRenderer from '@/components/store/themes/ThemeRenderer';
import ThemeInjector from '@/components/productPage/ThemeInjector';
import { SerializedStore } from '@/lib/data/store';
import { IProduct } from '@/models/products';

interface StoreThemePreviewProps {
    storeData: SerializedStore | null;
    products?: IProduct[];
    visible: boolean;
    onClose: () => void;
}

export default function StoreThemePreview({ 
    storeData, 
    products = [], 
    visible, 
    onClose 
}: StoreThemePreviewProps) {
    const [scale, setScale] = useState(0.4);

    // Calculate responsive scale
    useEffect(() => {
        const updateScale = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setScale(0.32);
            } else if (width < 1024) {
                setScale(0.45);
            } else if (width < 1280) {
                setScale(0.55);
            } else {
                setScale(0.65);
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    if (!visible || !storeData) return null;

    // Ensure themeId is a number
    const themeId = typeof storeData.themeId === 'number' ? storeData.themeId : 
                    typeof storeData.themeId === 'string' ? parseInt(storeData.themeId) || 1 : 1;

    // Create a preview store object that matches SerializedStore interface
    const previewStore: SerializedStore = {
        _id: storeData._id || 'preview',
        owner: storeData.owner || 'preview',
        brandName: storeData.brandName || '',
        domain: storeData.domain || '',
        description: storeData.description || '',
        themeId,
        theme: storeData.theme || { primaryColor: '#3B82F6' },
        themeStructure: storeData.themeStructure || {
            header: true,
            hero: true,
            about: true,
            trust: true,
            productGrid: true,
            footer: true,
        },
        hero: storeData.hero || {
            title: '',
            subtitle: '',
            imageUrl: '',
        },
        about: storeData.about || {
            title: '',
            description: '',
        },
        footer: storeData.footer || {
            text: '',
        },
        socialLinks: storeData.socialLinks,
        headerLinks: storeData.headerLinks || [],
        logoUrl: storeData.logoUrl,
        createdAt: storeData.createdAt || new Date().toISOString(),
        updatedAt: storeData.updatedAt || new Date().toISOString(),
    };

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />
                    
                    {/* Preview Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 sm:inset-8 md:inset-16 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Store Theme Preview</h3>
                                    <p className="text-sm text-gray-600">{previewStore.brandName}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                                aria-label="Close preview"
                            >
                                <X className="w-6 h-6 text-gray-700" />
                            </button>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 overflow-auto bg-gray-100 relative">
                            <div 
                                className="w-full h-full origin-top-left transition-transform duration-300"
                                style={{ 
                                    transform: `scale(${scale})`,
                                    width: `${100 / scale}%`,
                                    minHeight: `${100 / scale}%`,
                                    transformOrigin: 'top left'
                                }}
                            >
                                <ThemeInjector theme={previewStore.theme} />
                                <StoreProvider stores={[previewStore]} initialStore={previewStore}>
                                    <ThemeRenderer themeId={themeId} currentPage="STORE_PAGE" />
                                </StoreProvider>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 sm:p-6 border-t border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Preview scale: <span className="font-semibold">{(scale * 100).toFixed(0)}%</span>
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

