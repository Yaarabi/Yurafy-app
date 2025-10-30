"use client"
import { useParams, useRouter } from "next/navigation"

export const PLANS = {
    free: { 
        name: "Free", 
        price: 0, 
        description: "Test all features with limited usage." 
    },
    starter: { 
        name: "Starter", 
        price: 11, 
        description: "Basic store setup with branding and domain." 
    },
    whatsapp: { 
        name: "WhatsApp Automation", 
        price: 11, 
        description: "Automate messaging with WhatsApp Cloud API." 
    },
    aiAgent: { 
        name: "AI WhatsApp Agent", 
        price: 21, 
        description: "Automation + AI-powered WhatsApp assistant." 
    },
    proSeller: { 
        name: "Pro Seller", 
        price: 25, 
        description: "Starter + WhatsApp Automation for serious sellers." 
    },
    visionary: { 
        name: "Visionary", 
        price: 50, 
        description: "Pro Seller + AI Agent for full power scaling." 
    },
}

export default function PlanPage() {
    const router = useRouter()
    const params = useParams()

    return (
        <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-3xl font-extrabold text-center mb-10 text-gray-800">
            Choose Your Plan
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {Object.entries(PLANS).map(([key, plan]) => (
            <div
                key={key}
                className="flex flex-col justify-between rounded-xl border bg-white shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer touch-manipulation"
            >
                <div>
                <h2 className="text-xl font-semibold text-gray-900">{plan.name}</h2>
                <p className="mt-2 text-gray-600">{plan.description}</p>
                <p className="mt-4 text-2xl font-bold text-indigo-600">
                    {plan.price === 0 ? "Free" : `$${plan.price}/mo`}
                </p>
                </div>

                <button
                onClick={() => router.push(`/${params.locale}/onboarding/info?plan=${key}`)}
                className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 active:scale-95 transition-transform"
                >
                Select {plan.name}
                </button>
            </div>
            ))}
        </div>
        </div>
    )
}
