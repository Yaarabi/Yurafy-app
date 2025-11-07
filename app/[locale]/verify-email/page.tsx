'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BrandHeader from '@/components/login/brandHeader';
import Footer from '@/components/login/footer';
import VerifyEmailInfo from '@/components/auth/VerifyEmailInfo';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const { handleError } = useErrorHandler();
    const t = useTranslations('Auth');
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'info'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verified = searchParams.get('verified');
        const error = searchParams.get('error');
        
        if (verified === 'true' && token) {
            setStatus('success');
            setMessage(t('emailVerifiedSuccess') || 'Email verified successfully!');
            toast.success(t('emailVerifiedSuccess') || 'Email verified successfully!');
            setTimeout(() => {
                router.push(`/${params.locale}/login?verified=true`);
            }, 2000);
        } else if (error) {
            setStatus('error');
            if (error === 'invalid_token') {
                setMessage(t('invalidVerificationToken') || 'Invalid or expired verification token');
            } else if (error === 'missing_token') {
                setMessage(t('verificationTokenRequired') || 'Verification token is required');
            } else {
                setMessage(t('verificationFailed') || 'Verification failed');
            }
        } else if (token) {
            // If we have a token but no verified param, verify it
            verifyEmail(token);
        } else {
            setStatus('info');
        }
    }, [token, searchParams, router, params.locale]);

    const verifyEmail = async (verificationToken: string) => {
        try {
            const res = await fetch(`/api/auth/verify-email/${verificationToken}`, {
                method: 'GET',
                redirect: 'manual', // Don't follow redirects
            });
            
            // If it's a redirect (3xx), the verification was successful
            if (res.status >= 300 && res.status < 400) {
                setStatus('success');
                setMessage(t('emailVerifiedSuccess') || 'Email verified successfully!');
                toast.success(t('emailVerifiedSuccess') || 'Email verified successfully!');
                setTimeout(() => {
                    router.push(`/${params.locale}/login?verified=true`);
                }, 2000);
            } else {
                const data = await res.json().catch(() => ({}));
                setStatus('error');
                setMessage(data.error || data.message || t('verificationFailed') || 'Verification failed');
                handleError(new Error(data.error || data.message));
            }
        } catch (err) {
            setStatus('error');
            setMessage(t('verifyEmailError') || 'Failed to verify email');
            handleError(err, t('verifyEmailError') || 'Failed to verify email');
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col justify-center items-center px-4 py-8" style={{ backgroundColor: '#f0f9ff' }}>
            {/* Background decorations */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(14,165,233,0.1),_transparent_60%)]"></div>
            
            {/* Geometric shapes */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.15, scale: 1, rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-20 right-10 w-40 h-40 pointer-events-none hidden sm:block"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" opacity="0.2" />
                </svg>
            </motion.div>
            
            <div className="relative z-10 w-full max-w-md">
                <BrandHeader />
                
                {status === 'loading' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl w-full border border-gray-100 dark:border-gray-700 text-center"
                    >
                        <Loader2 className="w-12 h-12 text-[var(--brand-blue)] animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('verifyingEmail') || 'Verifying Email...'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t('verifyingEmailDescription') || 'Please wait while we verify your email address.'}
                        </p>
                    </motion.div>
                )}

                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl w-full border border-gray-100 dark:border-gray-700 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4"
                        >
                            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('emailVerified') || 'Email Verified!'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t('emailVerifiedDescription') || 'Your email has been verified successfully. Redirecting to login...'}
                        </p>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl w-full border border-gray-100 dark:border-gray-700 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4"
                        >
                            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('verificationFailedTitle') || 'Verification Failed'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {message || t('verificationLinkExpired') || 'The verification link is invalid or has expired.'}
                        </p>
                        <VerifyEmailInfo email={email || undefined} />
                    </motion.div>
                )}

                {status === 'info' && (
                    <VerifyEmailInfo email={email || undefined} />
                )}
                
                <Footer />
            </div>
        </div>
    );
}

