
"use client"
// import { PayPalButtons } from "@paypal/react-paypal-js"
import { useSearchParams, useRouter } from "next/navigation"

export default function CheckoutPage() {
    const plan = useSearchParams().get("plan")
    const router = useRouter()

    const planPrices: Record<string, number> = {
        starter: 10,
        whatsapp: 15,
        aiAgent: 25,
        proSeller: 30,
        visionary: 50,
        free: 0,
    }

    const price = planPrices[plan ?? "free"]

    if (price === 0) {
        router.push("/dashboard")
        return null
    }

    return (
        <div className="p-6">
        <h1 className="text-xl font-bold">Checkout – {plan}</h1>
        {/* <PayPalButtons
            createOrder={(data, actions) => {
            return actions.order.create({
                purchase_units: [{ amount: { value: price.toString() } }],
            })
            }}
            onApprove={async (data, actions) => {
            const details = await actions.order.capture()
            await fetch("/api/onboarding/activate-plan", {
                method: "POST",
                body: JSON.stringify({ plan, paymentId: details.id }),
            })
            router.push("/dashboard")
            }}
        /> */}
        </div>
    )
}
