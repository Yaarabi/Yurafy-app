'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
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

    // 🧠 Basic client-side validation
    const validate = () => {
        const newErrors: typeof errors = {};

        if (!email) newErrors.email = tAuth('errorRequired');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        newErrors.email = tAuth('errorInvalidEmail');

        if (!password) newErrors.password = tAuth('errorRequired');

        setErrors(newErrors);

        // Show toast for first error if exists
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
        toast.error(
            res === 'CredentialsSignin'
            ? tAuth('errorInvalidCredentials')
            : res
        );
        } else {
        toast.success(tAuth('loginSuccess'));
        }

        setLoading(false);
    };

    return (
        <form
        onSubmit={handleSubmit}
        className="bg-gray-900 bg-opacity-70 p-6 rounded-lg shadow-lg w-full max-w-md space-y-4"
        >
        <h2 className="text-white text-xl font-semibold text-center mb-4">
            {tAuth('loginTitle')}
        </h2>

        {/* 🟢 Email Input */}
        <InputField
            label={tAuth('emailLabel')}
            placeholder={tAuth('emailPlaceholder')}
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
        />

        {/* 🟢 Password Input */}
        <InputField
            label={tAuth('passwordLabel')}
            placeholder={tAuth('passwordPlaceholder')}
            type="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
        />

        <Button
            text={loading ? tAuth('loadingLogin') : tAuth('submitLogin')}
            disabled={loading}
        />

        <p className="text-gray-400 text-sm text-center mt-2">
            {tAuth('noAccountYet')}{' '}
            <a
            href={`/${params.locale}/signup`}
            className="text-cyan-400 hover:underline"
            >
            {tHero('signup')}
            </a>
        </p>
        </form>
    );
}
