'use client';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import InputField from './inputFailed';
import Button from './button';
import { useSignUp } from '@/hooks/auth/login';

export default function SignupForm() {
    const t = useTranslations('Auth');
    const tTitle = useTranslations('HeroSection');
    const params = useParams();

    const { signUpUser } = useSignUp(); // ✅ hook used at top level

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {
        const handel = await signUpUser(formData);
        return handel;
        } catch (error) {
        console.error("Error during sign-up:", error);
        return "An unexpected error occurred. Please try again.";
        }

    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-900 bg-opacity-70 p-6 rounded-lg mt-12 shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-white text-xl font-semibold text-center mb-4">
            {t('signupTitle')}
        </h2>

        <InputField label={t('firstNameLabel')} placeholder={t('firstNamePlaceholder')} type="text" name="name" />
        <InputField label={t('emailLabel')} placeholder={t('emailPlaceholder')} type="email" name="email" />
        <InputField label={t('passwordLabel')} placeholder={t('passwordPlaceholder')} type="password" name="password" />
        <InputField label={t('confirmPasswordLabel')} placeholder={t('confirmPasswordPlaceholder')} type="password" name="confirmPassword" />

        <Button text={t('submitSignup')} />

        <p className="text-gray-400 text-sm text-center mt-2">
            {t('alreadyHaveAccount')}{' '}
            <a href={`/${params.locale}/login`} className="text-cyan-400 hover:underline">
            {tTitle('login')}
            </a>
        </p>
        </form>
    );
}
