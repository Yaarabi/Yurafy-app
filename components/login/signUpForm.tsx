'use client';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import InputField from './inputFailed';
import Button from './button';

export default function SignupForm() {
    const t = useTranslations('Auth');
    const tTitle = useTranslations('HeroSection');
    const params = useParams(); // { locale: 'en' | 'fr' | 'ar' }

    return (
        <form className="bg-gray-900 bg-opacity-70 p-6 rounded-lg mt-12 shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-white text-xl font-semibold text-center mb-4">
            {t('signupTitle')}
        </h2>

        <InputField label={t('firstNameLabel')} placeholder={t('firstNamePlaceholder')} type="text" name="firstName" />
        <InputField label={t('lastNameLabel')} placeholder={t('lastNamePlaceholder')} type="text" name="lastName" />
        <InputField label={t('emailLabel')} placeholder={t('emailPlaceholder')} type="email" name="email" />
        <InputField label={t('passwordLabel')} placeholder={t('passwordPlaceholder')} type="password" name="password" />
        <InputField label={t('confirmPasswordLabel')} placeholder={t('confirmPasswordPlaceholder')} type="password" name="confirmPassword" />

        <Button text={t('submitSignup')} />

        <p className="text-gray-400 text-sm text-center mt-2">
            {t('alreadyHaveAccount')}{' '}
            <a
            href={`/${params.locale}/login`} // dynamic locale link
            className="text-cyan-400 hover:underline"
            >
            {tTitle('login')}
            </a>
        </p>
        </form>
    );
}
