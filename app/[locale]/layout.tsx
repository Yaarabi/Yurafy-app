import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { Metadata } from 'next';

async function getMessages(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch {
    return (await import(`../../messages/en.json`)).default;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'https://yurait.vercel.app';
  
  const titles: Record<string, string> = {
    en: 'Yurafy - AI-Powered Business Automation Platform',
    fr: 'Yurafy - Plateforme d\'Automatisation d\'Entreprise Alimentée par l\'IA',
    ar: 'Yurafy - منصة أتمتة الأعمال المدعومة بالذكاء الاصطناعي',
  };

  const descriptions: Record<string, string> = {
    en: 'Transform your business with AI-driven automation. Create stunning stores, automate WhatsApp messaging, and scale effortlessly with intelligent solutions.',
    fr: 'Transformez votre entreprise avec l\'automatisation pilotée par l\'IA. Créez des boutiques magnifiques, automatisez la messagerie WhatsApp et développez-vous sans effort.',
    ar: 'حوّل عملك بأتمتة مدفوعة بالذكاء الاصطناعي. أنشئ متاجر مذهلة، وأتمت رسائل واتساب، وتوسع بسهولة.',
  };

  const title = titles[locale] || titles.en;
  const description = descriptions[locale] || descriptions.en;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        en: `${baseUrl}/en`,
        fr: `${baseUrl}/fr`,
        ar: `${baseUrl}/ar`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : locale === 'fr' ? 'fr_FR' : 'ar_AR',
      url: `${baseUrl}/${locale}`,
      siteName: 'Yurafy',
      title,
      description,
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Yurafy Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/og-image.png`],
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Next 15 dynamic route params are async – await to satisfy runtime expectation
  const { locale } = await params;
  const supportedLocales = ['en', 'fr', 'ar'];

  if (!supportedLocales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
  );
}
