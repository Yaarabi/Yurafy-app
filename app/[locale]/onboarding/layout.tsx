
import { NextIntlClientProvider } from "next-intl"
import { notFound, redirect } from "next/navigation"
import { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"

async function getMessages(locale: string) {
    try {
        return (await import(`@/messages/${locale}.json`)).default
    } catch {
        return (await import(`@/messages/en.json`)).default
    }
}

export default async function Layout({
    children,
    params,
    }: {
    children: ReactNode
    params: Promise<{ locale: string }>
    }) {
    const { locale } = await params
    const supportedLocales = ["en", "fr", "ar"]

    if (!supportedLocales.includes(locale)) {
        notFound()
    }

    // 🔐 Secure onboarding: check session
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        // Not signed in → send to login
        redirect(`/${locale}/login`)
    }

    if (session.user.plan !== null) {
        // Already onboarded → block onboarding
        redirect(`/${locale}/dashboard`)
    }

    const messages = await getMessages(locale)

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
        <main className="min-h-screen">{children}</main>
        </NextIntlClientProvider>
    )
}
