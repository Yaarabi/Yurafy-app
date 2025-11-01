import { motion, AnimatePresence } from 'framer-motion';
import { Store, Palette, Globe, FileText, Image as ImageIcon, Info } from 'lucide-react';

interface StorePreviewData {
    brandName?: string;
    domain?: string;
    description?: string;
    themeId?: number;
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        textColor?: string;
    };
    hero?: {
        title?: string;
        subtitle?: string;
        imageUrl?: string;
    };
    about?: {
        title?: string;
        description?: string;
    };
    footer?: {
        text?: string;
    };
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
    };
}

interface StorePreviewProps {
    data: StorePreviewData | null;
    visible: boolean;
}

export default function StorePreview({ data, visible }: StorePreviewProps) {
    if (!visible) return null;
    
    // Show component even if data is partial - just show what we have
    if (!data) {
        return null;
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="bg-white rounded-xl shadow-lg border-2 border-indigo-200 p-6 mb-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Store className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Store Preview</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Brand Name & Domain */}
                        {(data.brandName || data.domain) ? (
                            <div className="flex flex-wrap gap-4 items-center">
                                {data.brandName && (
                                    <div className="flex items-center gap-2">
                                        <Store className="w-4 h-4 text-gray-500" />
                                        <span className="font-semibold text-gray-900">{data.brandName}</span>
                                    </div>
                                )}
                                {data.domain && (
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">/{data.domain}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 italic">No brand name or domain yet...</div>
                        )}

                        {/* Description */}
                        {data.description ? (
                            <div>
                                <p className="text-gray-700 text-sm">{data.description}</p>
                            </div>
                        ) : (
                            <div className="text-xs text-gray-400 italic">Description will appear here...</div>
                        )}

                        {/* Theme Info */}
                        {(data.themeId || data.theme?.primaryColor) && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Palette className="w-5 h-5 text-indigo-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        Theme #{data.themeId || 'N/A'}
                                    </p>
                                    {data.theme?.primaryColor && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div
                                                className="w-4 h-4 rounded border border-gray-300"
                                                style={{ backgroundColor: data.theme.primaryColor }}
                                            />
                                            <span className="text-xs text-gray-600">
                                                {data.theme.primaryColor}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Hero Section */}
                        {data.hero?.title && (
                            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <ImageIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-1">Hero Section</h4>
                                        <p className="text-sm text-gray-700 font-medium">{data.hero.title}</p>
                                        {data.hero.subtitle && (
                                            <p className="text-xs text-gray-600 mt-1">{data.hero.subtitle}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* About Section */}
                        {data.about?.title && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-1">About</h4>
                                        <p className="text-sm text-gray-700 font-medium">{data.about.title}</p>
                                        {data.about.description && (
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                {data.about.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        {data.footer?.text && (
                            <div className="p-3 bg-gray-100 rounded-lg">
                                <FileText className="w-4 h-4 text-gray-500 inline mr-2" />
                                <span className="text-xs text-gray-600">{data.footer.text}</span>
                            </div>
                        )}

                        {/* Social Links */}
                        {data.socialLinks && (data.socialLinks.facebook || data.socialLinks.instagram || data.socialLinks.twitter) && (
                            <div className="flex flex-wrap gap-3">
                                {data.socialLinks.facebook && (
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Facebook</span>
                                )}
                                {data.socialLinks.instagram && (
                                    <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded">Instagram</span>
                                )}
                                {data.socialLinks.twitter && (
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Twitter</span>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

