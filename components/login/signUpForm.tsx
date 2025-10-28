'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
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

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!form.username) newErrors.username = t('errorRequired');
        if (!form.email) newErrors.email = t('errorRequired');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        newErrors.email = t('errorInvalidEmail');
        if (!form.password) newErrors.password = t('errorRequired');
        else if (form.password.length < 6)
        newErrors.password = t('errorWeakPassword');
        if (form.password !== form.confirmPassword)
        newErrors.confirmPassword = t('errorPasswordMismatch');

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

    return (
        <form
        onSubmit={handleSubmit}
        className="bg-gray-900 bg-opacity-70 p-6 rounded-lg mt-12 shadow-lg w-full max-w-md space-y-4"
        >
        <h2 className="text-white text-xl font-semibold text-center mb-4">
            {t('signupTitle')}
        </h2>

        <InputField
            label={t('NameLabel')}
            placeholder={t('NamePlaceholder')}
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
            label={t('confirmPasswordLabel')}
            placeholder={t('confirmPasswordPlaceholder')}
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
        />

        <Button text={loading ? t('loadingSignup') : t('submitSignup')} disabled={loading} />

        <p className="text-gray-400 text-sm text-center mt-2">
            {t('alreadyHaveAccount')}{' '}
            <a
            href={`/${params.locale}/login`}
            className="text-cyan-400 hover:underline"
            >
            {tTitle('login')}
            </a>
        </p>
        </form>
    );
}
