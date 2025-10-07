'use client';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import InputField from './inputFailed';
import Button from './button';
import { useSignIn } from '@/hooks/auth/login';

export default function LoginForm() {
    const tAuth = useTranslations('Auth');
    const tHero = useTranslations('HeroSectionLogin');
    const params = useParams(); // { locale: 'en' | 'fr' | 'ar' }

    const { signInUser } = useSignIn();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        return await signInUser(formData);
        
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-gray-900 bg-opacity-70 p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-white text-xl font-semibold text-center mb-4">
                {tAuth('loginTitle')}
            </h2>

            <InputField label={tAuth('emailLabel')} placeholder={tAuth('emailPlaceholder')} type="email" name="email" />
            <InputField label={tAuth('passwordLabel')} placeholder={tAuth('passwordPlaceholder')} type="password" name="password" />
            <Button text={tAuth('submitLogin')} />

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
