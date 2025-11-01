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
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
            <p className="text-center text-lg text-red-600 font-medium">
            Invalid plan selected.
            </p>
        </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
            <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
            Checkout: <span className="text-indigo-600">{plan.name}</span>
            </h1>

            <div className="text-center mb-6 space-y-2">
            <p className="text-gray-600 text-sm sm:text-base">{plan.description}</p>
            <p className="text-indigo-600 font-semibold text-2xl sm:text-3xl">
                ${plan.price}
            </p>
            </div>

            <div className="border-t border-gray-200 my-4 sm:my-6"></div>

            <PayPalScriptProvider options={initialOptions}>
            <div className="flex flex-col items-center justify-center w-full">
                {loading && (
                <div className="flex justify-center mb-4">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                )}
                <PayPalButtons
                disabled={loading}
                style={{
                    layout: "vertical" as const,
                    color: "gold",
                    shape: "rect",
                    label: "paypal",
                }}
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
            </PayPalScriptProvider>
        </div>
        </div>
    );
}
