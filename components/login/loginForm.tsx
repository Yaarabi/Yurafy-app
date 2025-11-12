'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import InputField from './inputFailed';
import Button from './button';
import { useSignIn } from '@/hooks/auth/login';
import toast from 'react-hot-toast';

export default function LoginForm() {
    const tAuth = useTranslations('Auth');
    const tHero = useTranslations('HeroSectionLogin');
    const params = useParams();
    const { signInUser } = useSignIn();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);

    const locale = params.locale as string;
    const isRTL = locale === 'ar';
    const dir = isRTL ? 'rtl' : 'ltr';

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!email) newErrors.email = tAuth('errorRequired');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            newErrors.email = tAuth('errorInvalidEmail');

        if (!password) newErrors.password = tAuth('errorRequired');

        setErrors(newErrors);

        if (Object.values(newErrors).length > 0) {
            toast.error(Object.values(newErrors)[0]);
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        const res = await signInUser(formData);

        if (typeof res === 'string') {
            if (res === 'EMAIL_NOT_VERIFIED') {
                toast.error(tAuth('emailNotVerified') || 'Please verify your email address before logging in.');
                setTimeout(() => {
                    window.location.href = `/${params.locale}/verify-email?email=${encodeURIComponent(email)}`;
                }, 2000);
            } else {
                toast.error(
                    res === 'CredentialsSignin'
                        ? tAuth('errorInvalidCredentials')
                        : res
                );
            }
        } else {
            toast.success(tAuth('successLogin'));
        }

        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto p-8 bg-white shadow-xl rounded-2xl w-full border border-blue-50"
            dir={dir}
        >
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                {tAuth('loginTitle')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <InputField
                    label={tAuth('emailLabel')}
                    placeholder={tAuth('emailPlaceholder')}
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({ ...errors, email: '' });
                    }}
                    error={errors.email}
                    dir={dir}
                />

                <div className="space-y-1">
                    <InputField
                        label={tAuth('passwordLabel')}
                        placeholder={tAuth('passwordPlaceholder')}
                        type="password"
                        name="password"
                        required
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors({ ...errors, password: '' });
                        }}
                        error={errors.password}
                        dir={dir}
                    />
                    <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                        <a
                            href={`/${params.locale}/forgot-password`}
                            className="text-sm text-[var(--brand-blue)] hover:opacity-80 transition"
                        >
                            {tAuth('forgotPassword') || 'Forgot Password?'}
                        </a>
                    </div>
                </div>

                <Button
                    text={loading ? tAuth('loadingLogin') : tAuth('submitLogin')}
                    disabled={loading}
                />
            </form>

            <p className={`text-gray-600 text-sm text-center mt-6 ${isRTL ? 'rtl' : 'ltr'}`}>
                {tAuth('noAccountYet')}{' '}
                <a
                    href={`/${params.locale}/signup`}
                    className="font-medium hover:underline transition-colors"
                    style={{ color: '#0ea5e9' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0284c7'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#0ea5e9'}
                >
                    {tHero('signup')}
                </a>
            </p>
        </motion.div>
    );
}
