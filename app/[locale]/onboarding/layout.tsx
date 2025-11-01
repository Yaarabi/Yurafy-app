import { NextIntlClientProvider } from "next-intl";
import { notFound, redirect } from "next/navigation";
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import OnboardingGuard from "@/components/onboarding/OnboardingGuard";

async function getMessages(locale: string) {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch {
    return (await import(`@/messages/en.json`)).default;
  }
}

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supportedLocales = ["en", "fr", "ar"];

  if (!supportedLocales.includes(locale)) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const url = process.env.NEXT_PUBLIC_BASE_URL || "";
  let data;

  try {
    const res = await fetch(`${url}/api/auth/refresh`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId }),
    });

    if (!res.ok) {
      redirect(`/${locale}/login`);
    }

    data = await res.json();
  } catch {
    redirect(`/${locale}/login`);
  }

  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <OnboardingGuard 
        locale={locale} 
        onboardingCompleted={data.onboardingCompleted === true}
      >
        <main className="min-h-screen">{children}</main>
      </OnboardingGuard>
    </NextIntlClientProvider>
  );
}
