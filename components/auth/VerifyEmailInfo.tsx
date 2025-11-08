'use client';

import { useState } from 'react';
// next-intl types/imports can be inconsistent in some setups; use a ts-ignore to avoid blocking the build here
// @ts-ignore
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import Button from '@/components/login/button';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import toast from 'react-hot-toast';

interface VerifyEmailInfoProps {
    email?: string;
}

export default function VerifyEmailInfo({ email }: VerifyEmailInfoProps) {
    const t = useTranslations('Auth');
    const params = useParams();
    const { handleError } = useErrorHandler();
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleResendEmail = async () => {
        if (!email) return;

        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || data.message || 'Failed to send verification email');
            }

            setEmailSent(true);
            toast.success(t('verificationEmailSent') || 'Verification email sent!');
        } catch (err) {
            handleError(err, t('verificationEmailError') || 'Failed to send verification email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto p-4 sm:p-6 md:p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl w-full border border-gray-100 dark:border-gray-700"
        >
            <div className="text-center mb-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="mx-auto w-16 h-16 bg-[var(--brand-blue)]/10 rounded-full flex items-center justify-center mb-4"
                >
                    <Mail className="w-8 h-8 text-[var(--brand-blue)]" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('verifyEmail') || 'Verify Your Email'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('verifyEmailDescription') || 'We\'ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.'}
                </p>
            </div>

            {email && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {t('emailSentTo') || 'Email sent to:'}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">{email}</p>
                </div>
            )}

            {emailSent ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
                >
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-sm text-green-800 dark:text-green-200">
                        {t('verificationEmailResent') || 'Verification email has been resent!'}
                    </p>
                </motion.div>
            ) : null}

            <div className="space-y-3">
                {email && (
                    <button
                        onClick={handleResendEmail}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[var(--brand-blue)] text-[var(--brand-blue)] rounded-lg hover:bg-[var(--brand-blue)]/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                        {loading ? (t('sending') || 'Sending...') : (t('resendEmail') || 'Resend Verification Email')}
                    </button>
                )}
                
                <a
                    href={`/${params.locale}/login`}
                    className="block w-full text-center px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-[var(--brand-blue)] transition"
                >
                    <span className="inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        {t('backToLogin') || 'Back to login'}
                    </span>
                </a>
            </div>
        </motion.div>
    );
}

