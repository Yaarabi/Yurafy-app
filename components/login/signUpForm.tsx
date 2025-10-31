'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import InputField from './inputFailed';
import Button from './button';
import { useSignUp } from '@/hooks/auth/login';
import toast from 'react-hot-toast';

export default function SignupForm() {
    const t = useTranslations('Auth');
    const tTitle = useTranslations('HeroSection');
    const params = useParams();
    const { signUpUser } = useSignUp();

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

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
        if (!form.password) {
            newErrors.password = t('errorRequired');
        } else if (form.password.length < 6) {
            newErrors.password = t('errorWeakPassword') || 'Password must be at least 6 characters';
        }
        if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = t('errorPasswordMismatch') || 'Passwords do not match';
        }

        setErrors(newErrors);

        if (Object.values(newErrors).length > 0) {
            toast.error(Object.values(newErrors)[0]);
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
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

        try {
            const result = await signUpUser(formData);

            if (typeof result === 'string') {
                toast.error(result);
            } else {
                toast.success(t('successSignup') || 'Account created successfully! Redirecting...');
            }
        } catch (err) {
            console.error('Signup error:', err);
            toast.error(t('unexpectedError') || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            setGoogleLoading(true);
            await signIn('google', {
                callbackUrl: `/${params.locale}/dashboard`,
                redirect: true,
            });
        } catch (error) {
            console.error('Google sign-up error:', error);
            toast.error('Failed to sign up with Google');
            setGoogleLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto mt-20 p-8 bg-white shadow-xl rounded-2xl w-full"
        >
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                {t('signupTitle') || 'Create your account'}
            </h2>

            {/* Google Sign Up Button */}
            <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 mb-6 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.58c2.18-2.01 3.44-4.97 3.44-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.58-2.77c-1.08.72-2.45 1.16-4.35 1.16-3.34 0-6.17-2.25-7.18-5.29H1.18v2.84C3.15 20.53 7.24 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M4.82 14.19c-.25-.72-.38-1.49-.38-2.19s.13-1.47.38-2.19V7.17H1.18C.43 8.45 0 9.95 0 11.5s.43 3.05 1.18 4.33l3.64-2.64z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 4.75c1.88 0 3.57.65 4.9 1.9l3.58-3.58C17.95 1.19 15.24 0 12 0 7.24 0 3.15 2.47 1.18 6.17l3.64 2.84c1.01-3.04 3.84-5.26 7.18-5.26z"
                    />
                </svg>
                {googleLoading ? 'Signing up...' : 'Sign up with Google'}
            </button>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
            </div>

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
                />
                <InputField
                    label={t('passwordLabel')}
                    placeholder={t('passwordPlaceholder')}
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    required
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
                />

                <Button
                    text={loading ? (t('loadingSignup') || 'Creating account...') : (t('submitSignup') || 'Create Account')}
                    disabled={loading || googleLoading}
                />
            </form>

            <p className="text-gray-600 text-sm text-center mt-6">
                {t('alreadyHaveAccount') || 'Already have an account?'}{' '}
                <a
                    href={`/${params.locale}/login`}
                    className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                >
                    {tTitle('login') || 'Sign in'}
                </a>
            </p>
        </motion.div>
    );
}
