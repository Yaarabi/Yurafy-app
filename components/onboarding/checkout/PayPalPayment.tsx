'use client';

import { PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface PayPalPaymentProps {
    plan: {
        name: string;
        price: number;
    };
    planKey: string;
    locale: string;
    loading: boolean;
    onLoadingChange: (loading: boolean) => void;
}

export default function PayPalPayment({ 
    plan, 
    planKey, 
    locale, 
    loading, 
    onLoadingChange 
}: PayPalPaymentProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col items-stretch justify-center w-full">
            {loading && (
                <div className="flex justify-center items-center mb-4 sm:mb-6 py-2 sm:py-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 sm:border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-xs sm:text-sm md:text-base text-gray-600">
                        Processing payment...
                    </span>
                </div>
            )}
            
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
                        onLoadingChange(true);

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
                                        planKey: planKey,
                                    }),
                                });

                                if (!res.ok) {
                                    const errorText = await res.text();
                                    let errorMessage = "⚠️ Payment could not be verified. Please contact support.";
                                    try {
                                        const errorData = JSON.parse(errorText);
                                        errorMessage = errorData.error || errorMessage;
                                    } catch {
                                        // Use default message
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
                            .finally(() => onLoadingChange(false));
                    }}
                    onError={(err) => {
                        console.error("PayPal Error:", err);
                        toast.error("⚠️ Payment failed. Please try again.");
                    }}
                />
            </div>

            {/* Security Info */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 px-2 sm:px-0">
                    <svg 
                        className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                        />
                    </svg>
                    <p className="leading-relaxed">
                        Your payment is secure and encrypted. You will be redirected to PayPal for payment processing.
                    </p>
                </div>
            </div>
        </div>
    );
}
