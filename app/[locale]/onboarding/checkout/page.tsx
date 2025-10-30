"use client"

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { PLANS } from "../plan/page"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function CheckoutPage() {
    const searchParams = useSearchParams()
    const planKey = searchParams.get("plan")
    const params = useParams();
    const locale = params.locale;
    const router = useRouter()
    const plan = PLANS[planKey as keyof typeof PLANS]

    const [loading, setLoading] = useState(false);

    const [paypalReady, setPaypalReady] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setPaypalReady(true), 300)
        return () => clearTimeout(timer)
    }, [])

    const initialOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_ID || "",
        "buyer-country": "MA", 
        currency: "USD",
        components: "buttons",
        "enable-funding": "card",
    };

    if (!plan) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <p className="text-lg text-red-600 font-medium">Invalid plan selected.</p>
        </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Checkout: <span className="text-indigo-600">{plan.name}</span>
            </h1>

            <div className="mb-6 space-y-2 text-center">
            <p className="text-gray-600">{plan.description}</p>
            <p className="text-3xl font-semibold text-indigo-600">
                ${plan.price}
            </p>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            {paypalReady ? (
            <PayPalScriptProvider options={initialOptions}>
                <div className="min-h-[150px] flex items-center justify-center">
                <PayPalButtons
                    style={{
                        shape: "rect",
                        layout: "vertical",
                        color: "gold",
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
                    })
                    }}
                    onApprove={(data, actions) => {
                    if (!actions.order) return Promise.resolve();
                    setLoading(true);

                    return actions.order
                        .capture()
                        .then(async (details) => {
                        const orderId = details.id;
                        const buyerName =
                            details.payer?.name?.given_name || "Customer";

                        const res = await fetch("/api/paypal", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                            orderId,
                            plan: plan.name,
                            }),
                        });

                        const result = await res.json();

                        if (result.verified) {
                            toast.success(`Payment verified! Welcome, ${buyerName}.`);
                            router.push(`/${locale}/dashboard`);
                        } else {
                            toast.error(
                            "⚠️ Payment could not be verified. Please contact support."
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
                    console.error("PayPal Error:", err)
                    alert("⚠️ Payment failed. Please try again.")
                    }}
                />
                </div>
            </PayPalScriptProvider>
            ) : (
            <div className="flex items-center justify-center h-[150px]">
                <span className="text-gray-400 animate-pulse">
                Loading PayPal...
                </span>
            </div>
            )}
        </div>
        </div>
    )
}
