"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Check, 
    Mail, 
    Phone, 
    User, 
    MessageSquare,
    Sparkles,
    ArrowRight,
    CheckCircle2,
} from 'lucide-react';
import { FaShoppingCart, FaWhatsapp, FaTruck, FaBolt, FaRobot } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    FaShoppingCart,
    FaWhatsapp,
    FaTruck,
    FaBolt,
    FaRobot,
};

export interface Service {
    id: string;
    type: string;
    description: string;
    priceMin: number;
    priceMax: number;
    features: string[];
    icon: string;
    color: string;
    popular?: boolean;
}

interface ServicesClientProps {
    locale: string;
    services: Service[];
}

export default function ServicesClient({ locale, services }: ServicesClientProps) {
    const t = useTranslations('services');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        serviceType: '',
        message: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim() || formData.fullName.length < 2) {
            newErrors.fullName = t('form.errors.fullName');
        }

        const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/;
        if (!formData.phoneNumber.trim() || !phoneRegex.test(formData.phoneNumber)) {
            newErrors.phoneNumber = t('form.errors.phoneNumber');
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!formData.email.trim() || !emailRegex.test(formData.email)) {
            newErrors.email = t('form.errors.email');
        }

        if (!formData.serviceType) {
            newErrors.serviceType = t('form.errors.serviceType');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error(t('form.errors.validation'));
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/services/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit');
            }

            toast.success(t('form.success'));
            setIsFormOpen(false);
            setFormData({
                fullName: '',
                phoneNumber: '',
                email: '',
                serviceType: '',
                message: '',
            });
            setErrors({});
        } catch (error: any) {
            console.error('Error submitting form:', error);
            toast.error(error.message || t('form.errors.submit'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const openForm = (serviceType?: string) => {
        if (serviceType) {
            setFormData((prev) => ({ ...prev, serviceType }));
        }
        setIsFormOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-4" style={{ background: 'linear-gradient(to bottom right, var(--brand-blue), #1e40af, #3730a3)' }}>
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            {t('hero.title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            {t('hero.subtitle')}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-white/90">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-lg">{t('hero.tagline')}</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative group"
                        >
                            {service.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                                        ⭐ {t('popular')}
                                    </span>
                                </div>
                            )}
                            <div className="h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[var(--brand-blue)]">
                                <div className={`bg-gradient-to-r ${service.color} p-6 text-white`}>
                                    {(() => {
                                        const IconComponent = iconMap[service.icon];
                                        return IconComponent ? <IconComponent className="w-12 h-12 mb-4" /> : null;
                                    })()}
                                    <h3 className="text-2xl font-bold mb-2">{service.type}</h3>
                                    <p className="text-white/90 text-sm">{service.description}</p>
                                </div>
                                <div className="p-6">
                                    <div className="mb-6">
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {service.priceMin.toLocaleString()} - {service.priceMax.toLocaleString()} MAD
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {t('priceNote')}
                                        </div>
                                    </div>
                                    <ul className="space-y-3 mb-6">
                                        {service.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => openForm(service.type)}
                                        className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group hover:opacity-90"
                                        style={{ background: 'linear-gradient(to right, var(--brand-blue), #1e40af)' }}
                                    >
                                        {t('getStarted')}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-4xl mx-auto px-4 py-16 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="rounded-2xl p-12 text-white shadow-2xl"
                    style={{ background: 'linear-gradient(to right, var(--brand-blue), #3730a3)' }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t('cta.title')}
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        {t('cta.subtitle')}
                    </p>
                    <button
                        onClick={() => openForm()}
                        className="bg-white hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        style={{ color: 'var(--brand-blue)' }}
                    >
                        {t('cta.button')}
                    </button>
                </motion.div>
            </section>

            {/* Contact Form Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 p-6 flex items-center justify-between z-10" style={{ background: 'linear-gradient(to right, var(--brand-blue), #1e40af)' }}>
                                <h2 className="text-2xl font-bold text-white">{t('form.title')}</h2>
                                <button
                                    onClick={() => setIsFormOpen(false)}
                                    className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('form.fullName')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className={`w-full pl-11 pr-4 py-3 border ${
                                                errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            } rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                            style={{ '--tw-ring-color': 'var(--brand-blue)' } as React.CSSProperties}
                                            placeholder={t('form.fullNamePlaceholder')}
                                        />
                                    </div>
                                    {errors.fullName && (
                                        <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('form.phoneNumber')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            className={`w-full pl-11 pr-4 py-3 border ${
                                                errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            } rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                            style={{ '--tw-ring-color': 'var(--brand-blue)' } as React.CSSProperties}
                                            placeholder="+212 600 000 000"
                                        />
                                    </div>
                                    {errors.phoneNumber && (
                                        <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('form.email')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full pl-11 pr-4 py-3 border ${
                                                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            } rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                            style={{ '--tw-ring-color': 'var(--brand-blue)' } as React.CSSProperties}
                                            placeholder="example@email.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>

                                {/* Service Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('form.serviceType')} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="serviceType"
                                        value={formData.serviceType}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border ${
                                            errors.serviceType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                        style={{ '--tw-ring-color': 'var(--brand-blue)' } as React.CSSProperties}
                                    >
                                        <option value="">{t('form.selectService')}</option>
                                        {services.map((service) => (
                                            <option key={service.id} value={service.type}>
                                                {service.type} ({service.priceMin.toLocaleString()} - {service.priceMax.toLocaleString()} MAD)
                                            </option>
                                        ))}
                                    </select>
                                    {errors.serviceType && (
                                        <p className="mt-1 text-sm text-red-500">{errors.serviceType}</p>
                                    )}
                                </div>

                                {/* Message (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('form.message')} ({t('form.optional')})
                                    </label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                            style={{ '--tw-ring-color': 'var(--brand-blue)' } as React.CSSProperties}
                                            placeholder={t('form.messagePlaceholder')}
                                            maxLength={1000}
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {t('form.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-6 py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 hover:opacity-90"
                                        style={{ background: 'linear-gradient(to right, var(--brand-blue), #1e40af)' }}
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {t('form.submitting')}
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-5 h-5" />
                                                {t('form.submit')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
