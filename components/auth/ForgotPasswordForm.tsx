'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import InputField from '@/components/login/inputFailed';
import Button from '@/components/login/button';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import toast from 'react-hot-toast';

export default function ForgotPasswordForm() {
    const t = useTranslations('Auth');
    const params = useParams();
    const { handleError } = useErrorHandler();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [errors, setErrors] = useState<{ email?: string }>({});

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!email) {
            newErrors.email = t('errorRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = t('errorInvalidEmail');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || data.message || 'Failed to send reset email');
            }

            setEmailSent(true);
            toast.success(t('passwordResetEmailSent') || 'Password reset email sent!');
        } catch (err) {
            handleError(err, t('passwordResetError') || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl w-full border border-gray-100 dark:border-gray-700"
            >
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="mx-auto w-16 h-16 bg-[var(--brand-blue)]/10 rounded-full flex items-center justify-center mb-4"
                    >
                        <CheckCircle2 className="w-8 h-8 text-[var(--brand-blue)]" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('checkYourEmail') || 'Check your email'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {t('passwordResetEmailSentMessage', { email }) || `We've sent a password reset link to ${email}`}
                    </p>
                    <div className="space-y-3">
                        <a
                            href={`/${params.locale}/login`}
                            className="inline-flex items-center gap-2 px-4 py-2 text-[var(--brand-blue)] hover:opacity-80 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('backToLogin') || 'Back to login'}
                        </a>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto p-4 sm:p-6 md:p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl w-full border border-gray-100 dark:border-gray-700"
        >
            <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-[var(--brand-blue)]/10 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-[var(--brand-blue)]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('forgotPassword') || 'Forgot Password?'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('forgotPasswordDescription') || 'Enter your email address and we\'ll send you a link to reset your password.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <InputField
                    label={t('emailLabel')}
                    placeholder={t('emailPlaceholder')}
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({ ...errors, email: '' });
                    }}
                    error={errors.email}
                    required
                />

                <Button
                    text={loading ? (t('sending') || 'Sending...') : (t('sendResetLink') || 'Send Reset Link')}
                    disabled={loading}
                />
            </form>

            <div className="mt-6 text-center">
                <a
                    href={`/${params.locale}/login`}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[var(--brand-blue)] transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('backToLogin') || 'Back to login'}
                </a>
            </div>
        </motion.div>
    );
}

