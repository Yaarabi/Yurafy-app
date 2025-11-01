import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, FileText, Palette, Globe, Image, Info } from 'lucide-react';

interface StoreSummaryData {
    brandName?: string;
    domain?: string;
    description?: string;
    themeId?: number;
    theme?: {
        primaryColor?: string;
    };
    hero?: {
        title?: string;
        subtitle?: string;
    };
    about?: {
        title?: string;
        description?: string;
    };
    footer?: {
        text?: string;
    };
}

interface StoreSummaryProps {
    data: StoreSummaryData | null;
    visible: boolean;
}

export default function StoreSummary({ data, visible }: StoreSummaryProps) {
    if (!visible || !data) return null;

    const fields = [
        { key: 'brandName', label: 'Brand Name', value: data.brandName, icon: FileText },
        { key: 'domain', label: 'Domain', value: data.domain, icon: Globe },
        { key: 'description', label: 'Description', value: data.description, icon: FileText },
        { key: 'themeId', label: 'Theme', value: `Theme #${data.themeId}`, icon: Palette },
        { key: 'hero', label: 'Hero Section', value: data.hero?.title, icon: Image },
        { key: 'about', label: 'About Section', value: data.about?.title, icon: Info },
        { key: 'footer', label: 'Footer', value: data.footer?.text, icon: FileText },
    ].filter(field => field.value);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6 mb-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <CheckCircle2 className="w-8 h-8 text-indigo-600" />
                        <h3 className="text-2xl font-bold text-gray-900">Store Summary</h3>
                    </div>

                    <div className="space-y-3">
                        {fields.map((field) => {
                            const Icon = field.icon;
                            return (
                                <div
                                    key={field.key}
                                    className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm"
                                >
                                    <Icon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                            {field.label}
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 break-words">
                                            {field.value}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

