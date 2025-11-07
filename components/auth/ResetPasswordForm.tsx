'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import InputField from '@/components/login/inputFailed';
import Button from '@/components/login/button';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import toast from 'react-hot-toast';

export default function ResetPasswordForm() {
    const t = useTranslations('Auth');
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { handleError } = useErrorHandler();
    const token = searchParams.get('token');

    const [form, setForm] = useState({
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

    useEffect(() => {
        if (!token) {
            toast.error(t('invalidResetToken') || 'Invalid reset token');
            router.push(`/${params.locale}/forgot-password`);
        }
    }, [token, router, params.locale, t]);

    const validate = () => {
        const newErrors: typeof errors = {};
        
        if (!form.password) {
            newErrors.password = t('errorRequired');
        } else if (form.password.length < 8) {
            newErrors.password = t('errorWeakPassword') || 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
            newErrors.password = t('errorPasswordStrength') || 'Password must contain uppercase, lowercase, and number';
        }

        if (!form.confirmPassword) {
            newErrors.confirmPassword = t('errorRequired');
        } else if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = t('errorPasswordMismatch') || 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate() || !token) return;

        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    newPassword: form.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || data.message || 'Failed to reset password');
            }

            setSuccess(true);
            toast.success(t('passwordResetSuccess') || 'Password reset successfully!');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push(`/${params.locale}/login?reset=success`);
            }, 2000);
        } catch (err) {
            handleError(err, t('passwordResetError') || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return null;
    }

    if (success) {
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
                        className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4"
                    >
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('passwordResetSuccess') || 'Password Reset Successful!'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {t('passwordResetSuccessMessage') || 'Your password has been reset successfully. Redirecting to login...'}
                    </p>
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
                    <Lock className="w-8 h-8 text-[var(--brand-blue)]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('resetPassword') || 'Reset Password'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('resetPasswordDescription') || 'Enter your new password below.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('passwordLabel')}
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={(e) => {
                                setForm({ ...form, password: e.target.value });
                                setErrors({ ...errors, password: '' });
                            }}
                            placeholder={t('passwordPlaceholder')}
                            className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-[var(--brand-blue)] transition ${
                                errors.password
                                    ? 'border-red-500'
                                    : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('confirmPasswordLabel') || 'Confirm Password'}
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={(e) => {
                                setForm({ ...form, confirmPassword: e.target.value });
                                setErrors({ ...errors, confirmPassword: '' });
                            }}
                            placeholder={t('confirmPasswordPlaceholder') || 'Confirm your password'}
                            className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-[var(--brand-blue)] transition ${
                                errors.confirmPassword
                                    ? 'border-red-500'
                                    : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                </div>

                <Button
                    text={loading ? (t('resetting') || 'Resetting...') : (t('resetPassword') || 'Reset Password')}
                    disabled={loading}
                />
            </form>
        </motion.div>
    );
}

