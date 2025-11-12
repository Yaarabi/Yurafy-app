'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import InputField from './inputFailed';
import Button from './button';
import { useSignUp } from '@/hooks/auth/login';
import toast from 'react-hot-toast';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { normalizePhoneNumber } from '@/lib/utils/phoneUtils';

export default function SignupForm() {
    const t = useTranslations('Auth');
    const tTitle = useTranslations('HeroSection');
    const params = useParams();
    const { signUpUser } = useSignUp();

    const [form, setForm] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const locale = params.locale as string;
    const isRTL = locale === 'ar';
    const dir = isRTL ? 'rtl' : 'ltr';

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!form.username || form.username.trim().length < 3) {
            newErrors.username = t('errorRequired') || 'Username must be at least 3 characters';
        }
        if (!form.email) {
            newErrors.email = t('errorRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = t('errorInvalidEmail');
        }
        // Phone is optional, but if provided, validate format (PhoneInput returns formatted number with country code)
        if (form.phone && form.phone.trim() && form.phone.trim().length < 8) {
            newErrors.phone = t('errorInvalidPhone') || 'Please enter a valid phone number';
        }
        if (!form.password) {
            newErrors.password = t('errorRequired');
        } else if (form.password.length < 6) {
            newErrors.password = t('errorWeakPassword') || 'Password must be at least 6 characters';
        }
        if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = t('errorPasswordMismatch') || 'Passwords do not match';
        }
        if (!form.acceptTerms) {
            newErrors.acceptTerms = t('errorAcceptTerms') || 'You must accept the terms and conditions';
        }

        setErrors(newErrors);

        if (Object.values(newErrors).length > 0) {
            toast.error(Object.values(newErrors)[0]);
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({
            ...form,
            [e.target.name]: value,
        });
        setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('username', form.username.trim());
        formData.append('email', form.email.trim().toLowerCase());
        formData.append('password', form.password.trim());
        if (form.phone && form.phone.trim()) {
            // Normalize phone number to E.164 format before sending
            const normalizedPhone = normalizePhoneNumber(form.phone.trim());
            formData.append('phone', normalizedPhone);
        }
        formData.append('acceptTerms', form.acceptTerms.toString());

        try {
            const result = await signUpUser(formData);

            if (typeof result === 'string') {
                toast.error(result);
            } else {
                toast.success(t('successSignup') || 'Account created successfully! Please check your email to verify your account.');
                // Redirect to verification info page
                setTimeout(() => {
                    window.location.href = `/${params.locale}/verify-email?email=${encodeURIComponent(form.email)}`;
                }, 1500);
            }
        } catch (err) {
            console.error('Signup error:', err);
            toast.error(t('unexpectedError') || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto mt-20 p-8 bg-white shadow-xl rounded-2xl w-full border border-blue-50"
            dir={dir}
        >
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                {t('signupTitle') || 'Create your account'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <InputField
                    label={t('NameLabel') || 'Username'}
                    placeholder={t('NamePlaceholder') || 'Enter your username'}
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    error={errors.username}
                    required
                    dir={dir}
                />
                <InputField
                    label={t('emailLabel')}
                    placeholder={t('emailPlaceholder')}
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                    dir={dir}
                />
                {/* Phone Input */}
                <div className="space-y-1" dir={dir}>
                    <label
                        htmlFor="phone"
                        className={`block text-gray-700 mb-1 font-medium ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                        {t('phoneLabel')}
                    </label>
                    <div className={errors.phone ? 'border-red-500 rounded-lg' : ''}>
                        <PhoneInput
                            defaultCountry="ma"
                            value={form.phone}
                            onChange={(phone) => {
                                setForm({ ...form, phone });
                                setErrors((prev) => ({ ...prev, phone: '' }));
                            }}
                            className={`w-full ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-2 transition-all duration-200`}
                            inputStyle={{
                                width: '100%',
                                padding: '0.625rem 1rem',
                                border: errors.phone ? '1px solid #ef4444' : '1px solid #d1d5db',
                                borderRadius: '0.5rem',
                                outline: 'none',
                                textAlign: isRTL ? 'right' : 'left',
                                direction: dir,
                            }}
                        />
                    </div>
                    {errors.phone && (
                        <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>{errors.phone}</p>
                    )}
                </div>
                <InputField
                    label={t('passwordLabel')}
                    placeholder={t('passwordPlaceholder')}
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    required
                    dir={dir}
                />
                <InputField
                    label={t('confirmPasswordLabel') || 'Confirm Password'}
                    placeholder={t('confirmPasswordPlaceholder') || 'Confirm your password'}
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    required
                    dir={dir}
                />

                {/* Terms and Conditions Checkbox */}
                <div className="space-y-1">
                    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <input
                            type="checkbox"
                            id="acceptTerms"
                            name="acceptTerms"
                            checked={form.acceptTerms}
                            onChange={handleChange}
                            className="mt-1 h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-0 transition-colors"
                            style={{ 
                                accentColor: '#0ea5e9',
                                '--tw-ring-color': '#0ea5e9'
                            } as React.CSSProperties}
                        />
                        <label htmlFor="acceptTerms" className={`text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {t('acceptTermsLabel') || 'I accept the'}{' '}
                            <a
                                href={`/${params.locale}/terms`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium underline transition-colors"
                                style={{ color: '#0ea5e9' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#0284c7'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#0ea5e9'}
                            >
                                {t('termsAndPrivacy') || 'Terms & Privacy Policy'}
                            </a>
                            <span className={`text-red-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>*</span>
                        </label>
                    </div>
                    {errors.acceptTerms && (
                        <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'mr-7' : 'ml-7'} ${isRTL ? 'text-right' : 'text-left'}`}>{errors.acceptTerms}</p>
                    )}
                </div>

                <Button
                    text={loading ? (t('loadingSignup') || 'Creating account...') : (t('submitSignup') || 'Create Account')}
                    disabled={loading}
                />
            </form>

            <p className={`text-gray-600 text-sm text-center mt-6 ${isRTL ? 'rtl' : 'ltr'}`}>
                {t('alreadyHaveAccount') || 'Already have an account?'}{' '}
                <a
                    href={`/${params.locale}/login`}
                    className="font-medium hover:underline transition-colors"
                    style={{ color: '#0ea5e9' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0284c7'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#0ea5e9'}
                >
                    {tTitle('login') || 'Sign in'}
                </a>
            </p>
        </motion.div>
    );
}
