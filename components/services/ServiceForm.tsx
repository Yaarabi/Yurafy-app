"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, Mail, User, MessageSquare } from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';


interface ServiceFormProps {
    isOpen: boolean;
    onClose: () => void;
    services: Array<{
        id: string;
        type: string;
    }>;
    initialServiceType?: string;
}

export default function ServiceForm({ isOpen, onClose, services, initialServiceType }: ServiceFormProps) {
    const t = useTranslations('services');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        serviceType: initialServiceType || '',
        domainOfWork: '',
        message: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim() || formData.fullName.length < 2) {
            newErrors.fullName = t('form.errors.fullName');
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = t('form.errors.phoneNumber');
        }

        // Email is optional - only validate if provided
        if (formData.email.trim()) {
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = t('form.errors.email');
            }
        }

        if (!formData.serviceType) {
            newErrors.serviceType = t('form.errors.serviceType');
        }

        // Validate that service type is in the available services list or 'Other'
        if (formData.serviceType && formData.serviceType !== 'Other') {
            const isValidService = services.some(service => service.type === formData.serviceType);
            if (!isValidService) {
                newErrors.serviceType = `Invalid service type selected. Please choose from the dropdown.`;
            }
        }

        const isOther = formData.serviceType === 'Other';

        // domainOfWork validation: required if Other, else only length check
        if (isOther) {
            if (!formData.domainOfWork.trim()) {
                newErrors.domainOfWork = t('form.errors.domainOfWorkRequired');
            }
        }
        if (formData.domainOfWork && formData.domainOfWork.length > 100) {
            newErrors.domainOfWork = t('form.errors.domainOfWorkMax');
        }

        // message required if Other
        if (isOther) {
            if (!formData.message.trim()) {
                newErrors.message = t('form.errors.messageRequired');
            }
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
            // Log form data for debugging (server can help if needed)
            console.log('ServiceForm: Submitting inquiry', {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                serviceType: formData.serviceType,
                domainOfWork: formData.domainOfWork ? '[provided]' : '[empty]',
                message: formData.message ? '[provided]' : '[empty]',
            });

            const response = await fetch('/api/services/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                // Better error handling for API validation errors
                const errorMessage = data.message || data.error || 'Failed to submit';
                
                // Log server error for debugging
                console.error('ServiceForm submission error:', {
                    status: response.status,
                    error: data.error,
                    details: data.details,
                });
                
                // If there are detailed validation errors from the API
                if (data.details && Array.isArray(data.details)) {
                    toast.error(data.details[0] || errorMessage);
                } else {
                    toast.error(errorMessage);
                }
                
                return;
            }

            toast.success(t('form.success'));
            onClose();
            setFormData({
                fullName: '',
                phoneNumber: '',
                email: '',
                serviceType: '',
                domainOfWork: '',
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
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
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
                                onClick={onClose}
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
                                <div dir="ltr">
                                    <PhoneInput
                                        defaultCountry="ma"
                                        value={formData.phoneNumber}
                                        onChange={(phone) => {
                                            setFormData((prev) => ({ ...prev, phoneNumber: phone }));
                                            if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: '' }));
                                        }}
                                        className={`mt-1 block w-full border rounded-md ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                        style={{ '--react-international-phone-border-color': errors.phoneNumber ? '#fca5a5' : '#d1d5db', '--react-international-phone-focus-border-color': 'var(--brand-blue)' } as React.CSSProperties}
                                        placeholder="+1 555 555 5555"
                                    />
                                </div>
                                {errors.phoneNumber && (
                                    <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('form.email')} ({t('form.optional')})
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
                                {services.length === 0 && (
                                    <div className="p-3 mb-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            Services are loading. Please refresh the page if this persists.
                                        </p>
                                    </div>
                                )}
                                    <select
                                        name="serviceType"
                                        value={formData.serviceType}
                                        onChange={handleInputChange}
                                        disabled={services.length === 0}
                                        className={`w-full px-4 py-3 border ${
                                            errors.serviceType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                        style={{ '--tw-ring-color': 'var(--brand-blue)' } as React.CSSProperties}
                                    >
                                        <option value="">{t('form.selectService')}</option>
                                        {services.map((service) => (
                                            <option key={service.id} value={service.type}>
                                                {service.type}
                                            </option>
                                        ))}
                                        <option value="Other">{t('form.otherOption')}</option>
                                    </select>
                                {errors.serviceType && (
                                    <p className="mt-1 text-sm text-red-500">{errors.serviceType}</p>
                                )}
                            </div>

                            {/* Domain of Work (Optional / Required if Other) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('form.domainOfWork')} {formData.serviceType === 'Other' && <span className="text-red-500">*</span>} {formData.serviceType !== 'Other' && `(${t('form.optional')})`}
                                </label>
                                <input
                                    type="text"
                                    name="domainOfWork"
                                    value={formData.domainOfWork}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border ${
                                        errors.domainOfWork ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    } rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                    style={{ '--tw-ring-color': 'var(--brand-blue)' } as React.CSSProperties}
                                    placeholder={t('form.domainOfWorkPlaceholder')}
                                    maxLength={100}
                                />
                                {errors.domainOfWork && (
                                    <p className="mt-1 text-sm text-red-500">{errors.domainOfWork}</p>
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
                                                className={`w-full pl-11 pr-4 py-3 border ${errors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none`}
                                                style={{ '--tw-ring-color': 'var(--brand-blue)' } as React.CSSProperties}
                                                placeholder={t('form.messagePlaceholder')}
                                                maxLength={1000}
                                            />
                                            {errors.message && (
                                                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                                            )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
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
    );
}
