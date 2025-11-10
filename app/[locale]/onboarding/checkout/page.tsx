"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useState } from "react";
import CheckoutLoadingState from "@/components/onboarding/checkout/CheckoutLoadingState";
import CheckoutErrorState from "@/components/onboarding/checkout/CheckoutErrorState";
import CheckoutHeader from "@/components/onboarding/checkout/CheckoutHeader";
import PlanInfo from "@/components/onboarding/checkout/PlanInfo";
import PayPalPayment from "@/components/onboarding/checkout/PayPalPayment";
import { useCheckoutAuth } from "@/hooks/checkout/useCheckoutAuth";
import { usePlanFetch } from "@/hooks/checkout/usePlanFetch";

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const planKey = searchParams.get("plan");
    
    const localeRaw = String((params?.locale as string) || searchParams.get("locale") || "en");
    const locale = localeRaw.split('/').filter(Boolean)[0] || 'en';
    
    const [loading, setLoading] = useState(false);
    
    // Custom hooks for auth and plan fetching
    const { authChecking, emailVerified, sessionStatus } = useCheckoutAuth(locale, planKey);
    const { plan, planLoading, planError } = usePlanFetch(planKey);
    
    // No plan selected
    if (!planKey) {
        return (
            <CheckoutErrorState 
                error="No plan selected."
                onBackToPlan={() => router.push(`/${locale}/onboarding/plan`)}
            />
        );
    }

    // Loading state
    if (authChecking || planLoading || sessionStatus === "loading") {
        const message = authChecking ? "Verifying your account..." : "Loading plan information...";
        return <CheckoutLoadingState message={message} />;
    }
    
    // Not verified - redirect will happen
    if (!emailVerified) {
        return null;
    }

    // Error state
    if (planError || !plan) {
        return (
            <CheckoutErrorState 
                error={planError || `Invalid plan selected: "${planKey}"`}
                onBackToPlan={() => router.push(`/${locale}/onboarding/plan`)}
            />
        );
    }

    // PayPal configuration
    const paypalOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_ID || "",
        "buyer-country": "MA",
        currency: "USD",
        components: "buttons",
        "enable-funding": "card",
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-4 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-full max-w-md lg:max-w-lg bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200">
                <CheckoutHeader planName={plan.name} />
                <PlanInfo 
                    description={plan.description}
                    price={plan.price}
                    duration={plan.duration}
                />
                
                <div className="border-t border-gray-200 my-4 sm:my-5 md:my-6"></div>

                <PayPalScriptProvider options={paypalOptions}>
                    <PayPalPayment
                        plan={plan}
                        planKey={planKey}
                        locale={locale}
                        loading={loading}
                        onLoadingChange={setLoading}
                    />
                </PayPalScriptProvider>
            </div>
        </div>
    );
}
