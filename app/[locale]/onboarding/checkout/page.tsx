"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { PLANS } from "../plan/page";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const planKey = searchParams.get("plan");
    // Get locale from URL params
    const locale = (params?.locale as string) || searchParams.get("locale") || "en";
    const plan = PLANS[planKey as keyof typeof PLANS];

    const [loading, setLoading] = useState(false);

    const initialOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_ID || "",
        "buyer-country": "MA",
        currency: "USD",
        components: "buttons",
        "enable-funding": "card",
    };


    if (!plan) {
        return (
            <div className="min-h-screen flex items-center justify-center py-4 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="w-full max-w-md bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 text-center">
                    <p className="text-base sm:text-lg md:text-xl text-red-600 font-medium mb-4">
                        Invalid plan selected.
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
