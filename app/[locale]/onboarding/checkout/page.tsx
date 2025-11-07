"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { PLANS } from "../plan/page";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const planKey = searchParams.get("plan");
    // ✅ FIX: Normalize locale - extract first segment only, prevent duplication
    const localeRaw = String((params?.locale as string) || searchParams.get("locale") || "en");
    const locale = localeRaw.split('/').filter(Boolean)[0] || 'en';
    
    // ✅ FIX: Validate plan key exists in PLANS object
    if (!planKey) {
        return (
            <div className="min-h-screen flex items-center justify-center py-4 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="w-full max-w-md bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 text-center">
                    <p className="text-base sm:text-lg md:text-xl text-red-600 font-medium mb-4">
                        No plan selected.
                    </p>
                    <button
                        onClick={() => router.push(`/${locale}/onboarding/plan`)}
                        className="px-4 py-2 sm:px-6 sm:py-2.5 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        Choose a Plan
                    </button>
                </div>
            </div>
        );
    }
    
    // ✅ FIXED: Fetch plan from database API instead of hardcoded PLANS
    const [plan, setPlan] = useState<any>(null);
    const [planLoading, setPlanLoading] = useState(true);
    const [planError, setPlanError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                setPlanLoading(true);
                const res = await fetch(`/api/plans`);
                if (!res.ok) throw new Error('Failed to fetch plans');
                const data = await res.json();
                
                // Check both regular and special plans
                const allPlans = [...(data.plans || []), ...(data.specialPlans || [])];
                const foundPlan = allPlans.find((p: any) => 
                    p.planKey?.toLowerCase() === planKey?.toLowerCase() ||
                    p.name?.toLowerCase() === planKey?.toLowerCase()
                );
                
                if (foundPlan) {
                    setPlan(foundPlan);
                } else {
                    // Fallback to hardcoded PLANS for backward compatibility
                    const fallbackPlan = PLANS[planKey as keyof typeof PLANS] || 
                        Object.entries(PLANS).find(([key]) => key.toLowerCase() === planKey.toLowerCase())?.[1] ||
                        Object.values(PLANS).find(p => p.name.toLowerCase().replace(/\s+/g, '') === planKey.toLowerCase().replace(/\s+/g, ''));
                    if (fallbackPlan) {
                        setPlan(fallbackPlan);
                    } else {
                        setPlanError(`Plan "${planKey}" not found`);
                    }
                }
            } catch (err) {
                console.error('Error fetching plan:', err);
                // Fallback to hardcoded PLANS
                const fallbackPlan = PLANS[planKey as keyof typeof PLANS] || 
                    Object.entries(PLANS).find(([key]) => key.toLowerCase() === planKey.toLowerCase())?.[1] ||
                    Object.values(PLANS).find(p => p.name.toLowerCase().replace(/\s+/g, '') === planKey.toLowerCase().replace(/\s+/g, ''));
                if (fallbackPlan) {
                    setPlan(fallbackPlan);
                } else {
                    setPlanError('Failed to load plan information');
                }
            } finally {
                setPlanLoading(false);
            }
        };
        
        if (planKey) {
            fetchPlan();
        }
    }, [planKey]);

    // Show loading state
    if (planLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center py-4 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="w-full max-w-md bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 text-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading plan information...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (planError || !plan) {
        const availablePlans = Object.keys(PLANS).join(", ");
        return (
            <div className="min-h-screen flex items-center justify-center py-4 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="w-full max-w-md bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 text-center">
                    <p className="text-base sm:text-lg md:text-xl text-red-600 font-medium mb-2">
                        {planError || `Invalid plan selected: "${planKey}"`}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                        Please select a valid plan from the plan selection page.
                    </p>
                    <button
                        onClick={() => router.push(`/${locale}/onboarding/plan`)}
                        className="px-4 py-2 sm:px-6 sm:py-2.5 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        Choose a Plan
                    </button>
                </div>
            </div>
        );
    }

    const [loading, setLoading] = useState(false);

    const initialOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_ID || "",
        "buyer-country": "MA",
        currency: "USD",
        components: "buttons",
        "enable-funding": "card",
    };


    if (!plan) {
        // ✅ FIX: Better error message showing what plan was requested
        const availablePlans = Object.keys(PLANS).join(", ");
        return (
            <div className="min-h-screen flex items-center justify-center py-4 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="w-full max-w-md bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 text-center">
                    <p className="text-base sm:text-lg md:text-xl text-red-600 font-medium mb-2">
                        Invalid plan selected: "{planKey}"
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                        Available plans: {availablePlans}
                    </p>
                    <button
                        onClick={() => router.push(`/${locale}/onboarding/plan`)}
                        className="px-4 py-2 sm:px-6 sm:py-2.5 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        Choose a Plan
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-4 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-full max-w-md lg:max-w-lg bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200">
                {/* Header */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
                        Checkout: <span className="text-indigo-600">{plan.name}</span>
                    </h1>
                </div>

                {/* Plan Info */}
                <div className="text-center mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed px-2 sm:px-4">
                        {plan.description}
                    </p>
                    <div className="pt-2">
                        <p className="text-indigo-600 font-semibold text-2xl sm:text-3xl md:text-4xl">
                            ${plan.price}
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">
                            per {plan.duration || 'month'}
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4 sm:my-5 md:my-6"></div>

                {/* PayPal Section */}
                <PayPalScriptProvider options={initialOptions}>
                    <div className="flex flex-col items-stretch justify-center w-full">
                        {loading && (
                            <div className="flex justify-center items-center mb-4 sm:mb-6 py-2 sm:py-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 sm:border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-xs sm:text-sm md:text-base text-gray-600">Processing payment...</span>
                            </div>
                        )}
                        {/* PayPal Buttons Wrapper - Responsive */}
                        <div className="w-full overflow-hidden [&>div]:w-full [&>div]:max-w-full [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:!min-h-[48px] sm:[&_iframe]:!min-h-[55px] md:[&_iframe]:!min-h-[60px]">
                            <PayPalButtons
                                disabled={loading}
                                style={{
                                    layout: "vertical" as const,
                                    color: "gold",
                                    shape: "rect",
                                    label: "paypal",
                                    height: 48,
                                }}
                                forceReRender={[plan.price]}
                                createOrder={(data, actions) => {
                                    return actions.order.create({
                                        intent: "CAPTURE",
                                        purchase_units: [
                                            {
                                                amount: {
                                                    currency_code: "USD",
                                                    value: plan.price.toString(),
                                                },
                                                description: plan.name,
                                            },
                                        ],
                                    });
                                }}
                                onApprove={(data, actions) => {
                                    if (!actions.order) return Promise.resolve();
                                    setLoading(true);

                                    return actions.order
                                        .capture()
                                        .then(async (details) => {
                                            const orderId = details.id;
                                            const buyerName = details.payer?.name?.given_name || "Customer";

                                            const res = await fetch("/api/paypal", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    orderId,
                                                    plan: plan.name,
                                                    planKey: planKey, // Pass the plan key to identify plan type
                                                }),
                                            });

                                            // Check response status before parsing JSON
                                            if (!res.ok) {
                                                const errorText = await res.text();
                                                let errorMessage = "⚠️ Payment could not be verified. Please contact support.";
                                                try {
                                                    const errorData = JSON.parse(errorText);
                                                    errorMessage = errorData.error || errorMessage;
                                                } catch {
                                                    // If not JSON, use default message
                                                }
                                                toast.error(errorMessage);
                                                console.error("Payment verification failed:", res.status, errorText);
                                                return;
                                            }

                                            const result = await res.json();

                                            if (result.verified) {
                                                toast.success(`Payment verified! Welcome, ${buyerName}.`);
                                                router.push(`/${locale}/dashboard`);
                                            } else {
                                                toast.error(
                                                    result.error || "⚠️ Payment could not be verified. Please contact support."
                                                );
                                            }
                                        })
                                        .catch((err) => {
                                            console.error("PayPal error:", err);
                                            toast.error("⚠️ Payment failed. Please try again.");
                                        })
                                        .finally(() => setLoading(false));
                                }}
                                onError={(err) => {
                                    console.error("PayPal Error:", err);
                                    toast.error("⚠️ Payment failed. Please try again.");
                                }}
                            />
                        </div>
                        {/* Additional Info */}
                        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                            <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 px-2 sm:px-0">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <p className="leading-relaxed">
                                    Your payment is secure and encrypted. You will be redirected to PayPal for payment processing.
                                </p>
                            </div>
                        </div>
                    </div>
                </PayPalScriptProvider>
            </div>
        </div>
    );
}
