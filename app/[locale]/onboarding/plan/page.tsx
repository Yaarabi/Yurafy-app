"use client"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Sparkles, Store, MessageCircle, Bot, Crown, Zap } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"

export const PLANS = {
    free: { 
        name: "Free", 
        price: 0, 
        description: "Test all features with limited usage.",
        icon: Zap,
        color: "from-gray-400 to-gray-600",
        features: ["5 Products", "10 Orders", "Basic Support"]
    },
    starter: { 
        name: "Starter", 
        price: 11, 
        description: "Basic store setup with branding and domain.",
        icon: Store,
        color: "from-blue-400 to-blue-600",
        features: ["50 Products", "Custom Domain", "Custom Theme", "SEO Tools"]
    },
    whatsapp: { 
        name: "WhatsApp Automation", 
        price: 11, 
        description: "Automate messaging with WhatsApp Cloud API.",
        icon: MessageCircle,
        color: "from-green-400 to-green-600",
        features: ["500 Contacts", "Auto Replies", "Templates", "Broadcasts"]
    },
    aiAgent: { 
        name: "AI WhatsApp Agent", 
        price: 21, 
        description: "Automation + AI-powered WhatsApp assistant.",
        icon: Bot,
        color: "from-purple-400 to-purple-600",
        features: ["1000 Contacts", "AI Assistant", "Smart Replies", "Multi-language"]
    },
    proSeller: { 
        name: "Pro Seller", 
        price: 25, 
        description: "Starter + WhatsApp Automation for serious sellers.",
        icon: Crown,
        color: "from-yellow-400 to-orange-600",
        features: ["500 Products", "Store + WhatsApp", "2000 Contacts", "Priority Support"]
    },
    visionary: { 
        name: "Visionary", 
        price: 50, 
        description: "Pro Seller + AI Agent for full power scaling.",
        icon: Sparkles,
        color: "from-indigo-400 via-purple-500 to-pink-600",
        features: ["Unlimited Products", "All Features", "AI Agent", "Custom CSS/JS", "Priority Support"]
    },
}

const planTypes = {
    FREE: ['free'],
    WHATSAPP: ['whatsapp', 'aiAgent'],
    STORE: ['starter', 'proSeller', 'visionary']
}

export default function PlanPage() {
    const router = useRouter()
    const params = useParams()
    const [loading, setLoading] = useState<string | null>(null)

    const handlePlanSelect = async (planKey: string) => {
        setLoading(planKey)

        try {
            // Free plan → redirect to dashboard
            if (planTypes.FREE.includes(planKey)) {
                router.push(`/${params.locale}/dashboard`)
                return
            }

            // WhatsApp plans → create WhatsApp account then checkout
            if (planTypes.WHATSAPP.includes(planKey)) {
                try {
                    const response = await fetch('/api/whatsapp/account', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            waBusinessId: 'temp-' + Date.now(),
                            waNumberId: 'temp-' + Date.now(),
                            waNumber: '+1234567890',
                            waToken: 'temp-token-' + Date.now(),
                            settings: {
                                autoReply: planKey === 'aiAgent',
                                aiAgent: planKey === 'aiAgent',
                            },
                        }),
                    })

                    if (!response.ok) {
                        const data = await response.json()
                        throw new Error(data.error || 'Failed to create WhatsApp account')
                    }

                    toast.success('WhatsApp account created!')
                    router.push(`/${params.locale}/onboarding/checkout?plan=${planKey}`)
                } catch (error: any) {
                    console.error('Error creating WhatsApp account:', error)
                    toast.error(error.message || 'Failed to create WhatsApp account')
                    setLoading(null)
                }
                return
            }

            // Store plans → redirect to onboarding/info
            if (planTypes.STORE.includes(planKey)) {
                router.push(`/${params.locale}/onboarding/info?plan=${planKey}`)
                return
            }
        } catch (error) {
            console.error('Error selecting plan:', error)
            toast.error('Something went wrong. Please try again.')
            setLoading(null)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block mb-4"
                    >
                        <Sparkles className="w-12 h-12 text-indigo-600 mx-auto" />
                    </motion.div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                        Select the perfect plan for your business needs
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {Object.entries(PLANS).map(([key, plan], index) => {
                        const Icon = plan.icon
                        const isLoading = loading === key
                        const isPopular = key === 'proSeller'

                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative flex flex-col rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                                    isPopular 
                                        ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-white scale-105' 
                                        : 'bg-white'
                                }`}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                                        MOST POPULAR
                                    </div>
                                )}

                                {/* Gradient Header */}
                                <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <Icon className="w-8 h-8" />
                                        {plan.price === 0 && (
                                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                                                FREE
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                                    <p className="text-white/90 text-sm mb-4">{plan.description}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold">
                                            {plan.price === 0 ? 'Free' : `$${plan.price}`}
                                        </span>
                                        {plan.price > 0 && (
                                            <span className="text-white/70 text-lg">/mo</span>
                                        )}
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="p-6 flex-grow">
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* CTA Button */}
                                <div className="p-6 pt-0">
                                    <button
                                        onClick={() => handlePlanSelect(key)}
                                        disabled={isLoading}
                                        className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                                            plan.price === 0
                                                ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                                                : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                                        } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Select {plan.name}</span>
                                                {isPopular && <Crown className="w-5 h-5" />}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>
        </div>
    )
}
