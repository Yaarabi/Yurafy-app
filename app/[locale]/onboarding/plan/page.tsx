"use client"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Sparkles, Store, MessageCircle, Bot, Crown, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import { FaCheck } from "react-icons/fa"

// Icon mapping for plan templates
const iconMap: Record<string, any> = {
    zap: Zap,
    store: Store,
    messagecircle: MessageCircle,
    bot: Bot,
    crown: Crown,
    sparkles: Sparkles,
};

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
        features: ["500 Orders", "Custom Domain", "Custom Theme", "SEO Tools"]
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
        features: ["1500 Orders", "Store + WhatsApp", "2000 Contacts", "Priority Support"]
    },
    visionary: { 
        name: "Visionary", 
        price: 50, 
        description: "Pro Seller + AI Agent for full power scaling.",
        icon: Sparkles,
        color: "from-indigo-400 via-purple-500 to-pink-600",
        features: ["Unlimited Orders", "All Features", "AI Agent", "Priority Support"]
    },
}

const planTypes = {
    FREE: ['free'],
    WHATSAPP_ONLY: ['whatsapp', 'aiAgent'],
    STORE_ONLY: ['starter'],
    MIXED: ['proSeller', 'visionary'] // Store + WhatsApp
}

export default function PlanPage() {
    const router = useRouter()
    const params = useParams()
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState<string | null>(null)
    const [isUpgrade, setIsUpgrade] = useState(false)
    const [plans, setPlans] = useState(PLANS)
    const [specialPlans, setSpecialPlans] = useState<any[]>([])
    const [plansLoading, setPlansLoading] = useState(true)

    // Fetch plans from API
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch('/api/plans?includeSpecial=true');
                if (res.ok) {
                    const data = await res.json();
                    // Convert plan templates to display format
                    const regularPlans: any = {};
                    (data.plans || []).forEach((template: any) => {
                        regularPlans[template.planKey] = {
                            name: template.name,
                            price: template.defaultPrice,
                            description: template.description,
                            icon: iconMap[template.icon?.toLowerCase() || 'store'] || Store,
                            color: template.color || 'from-blue-400 to-blue-600',
                            features: extractFeatures(template.features),
                        };
                    });
                    
                    const special = (data.specialPlans || []).map((template: any) => ({
                        key: template.planKey,
                        name: template.name,
                        price: template.defaultPrice,
                        description: template.description,
                        icon: iconMap[template.icon?.toLowerCase() || 'store'] || Store,
                        color: template.color || 'from-blue-400 to-blue-600',
                        features: extractFeatures(template.features),
                        isSpecial: true,
                        basePlanKey: template.basePlanKey,
                        durationDays: template.defaultDurationDays,
                    }));

                    if (Object.keys(regularPlans).length > 0) {
                        setPlans({ ...PLANS, ...regularPlans });
                    }
                    setSpecialPlans(special);
                }
            } catch (err) {
                console.error('Failed to fetch plans:', err);
                // Use default plans on error
            } finally {
                setPlansLoading(false);
            }
        };
        fetchPlans();
    }, []);

    // Helper function to extract features from plan template
    const extractFeatures = (features: any): string[] => {
        const featureList: string[] = [];
        if (features.store?.enabled) {
            if (features.store.maxProducts) featureList.push(`${features.store.maxProducts} Products`);
            if (features.store.customDomain) featureList.push('Custom Domain');
            if (features.store.customTheme) featureList.push('Custom Theme');
            if (features.store.seo) featureList.push('SEO Tools');
        }
        if (features.whatsapp?.enabled) {
            if (features.whatsapp.maxContacts) featureList.push(`${features.whatsapp.maxContacts} Contacts`);
            if (features.whatsapp.automation) featureList.push('Auto Replies');
            if (features.whatsapp.templates) featureList.push('Templates');
            if (features.whatsapp.broadcasts) featureList.push('Broadcasts');
        }
        if (features.ai?.enabled) {
            if (features.ai.agent) featureList.push('AI Assistant');
            if (features.ai.contentGeneration) featureList.push('Smart Replies');
            if (features.ai.languageSupport?.length > 0) featureList.push('Multi-language');
        }
        if (features.orders?.enabled) {
            if (features.orders.maxOrders) featureList.push(`${features.orders.maxOrders} Orders`);
            if (features.orders.orderTracking) featureList.push('Order Tracking');
        }
        if (features.support?.priority) featureList.push('Priority Support');
        return featureList.length > 0 ? featureList : ['Basic Features'];
    };

    // Check if user has completed onboarding (upgrade scenario)
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: session.user.id }),
            })
                .then(async (res) => {
                    if (res.ok) {
                        const data = await res.json();
                        setIsUpgrade(data.onboardingCompleted === true);
                    }
                })
                .catch(() => {
                    setIsUpgrade(false);
                });
        }
    }, [status, session]);

    const handlePlanSelect = async (planKey: string) => {
        setLoading(planKey)

        try {
            // ✅ FIX: Normalize locale - extract first segment only, remove slashes
            const localeRaw = String(params.locale || 'en');
            const locale = localeRaw.split('/').filter(Boolean)[0] || 'en';
            
            // Free plan → redirect to info page to create store
            if (planTypes.FREE.includes(planKey)) {
                router.push(`/${locale}/onboarding/info?plan=${planKey}`)
                return
            }

            // If this is an upgrade (user has completed onboarding), use upgrade API
            if (isUpgrade) {
                // ✅ FIX: Use normalized locale
                const localeRaw = String(params.locale || 'en');
                const locale = localeRaw.split('/').filter(Boolean)[0] || 'en';
                
                const response = await fetch('/api/upgrade', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planKey, locale }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    toast.error(error.error || 'Failed to process upgrade');
                    setLoading(null);
                    return;
                }

                const result = await response.json();
                
                if (result.created && result.created.length > 0) {
                    toast.success(
                        `Created: ${result.created.join(', ')}. Redirecting...`,
                        { duration: 2000 }
                    );
                }

                // Wait a bit for toast to show
                setTimeout(() => {
                    router.push(`${result.redirectTo}`);
                }, 500);
                return;
            }

            // First-time onboarding flow (existing logic)
            // WhatsApp-only plans → redirect directly to checkout
            // WhatsApp account will be created after successful payment
            if (planTypes.WHATSAPP_ONLY.includes(planKey)) {
                router.push(`/${locale}/onboarding/checkout?plan=${planKey}`)
                return
            }

            // Store-only plans → redirect to onboarding/info to create store first
            if (planTypes.STORE_ONLY.includes(planKey)) {
                router.push(`/${locale}/onboarding/info?plan=${planKey}`)
                return
            }

            // Mixed plans (Store + WhatsApp) → redirect to info page to create store first
            // WhatsApp account will be created after successful payment
            if (planTypes.MIXED.includes(planKey)) {
                router.push(`/${locale}/onboarding/info?plan=${planKey}`)
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
                        {isUpgrade ? 'Upgrade Your Plan' : 'Choose Your Plan'}
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                        {isUpgrade 
                            ? 'Select a plan to upgrade. Missing features will be created automatically.' 
                            : 'Select the perfect plan for your business needs'
                        }
                    </p>
                    {isUpgrade && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium"
                        >
                            <Crown className="w-4 h-4" />
                            <span>Upgrade Mode: Features will be set up automatically</span>
                        </motion.div>
                    )}
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {Object.entries(PLANS).map(([key, plan], index) => {
                        const Icon = plan.icon
                        const isLoading = loading === key
                        const isPopular = key === 'proSeller'
                        const isHighlighted = key === 'visionary'

                        return (
                            <motion.div
                                key={key}
                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                whileInView={{ scale: 1, opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className={`relative p-6 sm:p-8 rounded-2xl shadow-xl transition-all duration-300 cursor-pointer touch-manipulation active:scale-[0.98] ${
                                    isHighlighted
                                        ? `bg-gradient-to-br ${plan.color} text-white border-2 border-transparent`
                                        : "bg-white border-2 border-gray-200 hover:border-blue-400"
                                }`}
                            >
                                {(isHighlighted || isPopular) && (
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-semibold bg-yellow-400 text-gray-900 rounded-full shadow-lg">
                                        {isHighlighted ? "⭐ Best Value" : "⭐ Popular"}
                                    </span>
                                )}
                                <div className={`flex items-center gap-3 mb-4 ${isHighlighted ? "text-white" : "text-gray-900"}`}>
                                    <div className={`p-3 rounded-lg bg-gradient-to-br ${plan.color} bg-opacity-10 ${isHighlighted ? "bg-opacity-20" : ""}`}>
                                        <Icon className={`w-6 h-6 ${isHighlighted ? "text-white" : `text-gradient-to-r ${plan.color.split(' ')[1]}`}`} />
                                    </div>
                                    <h3 className={`text-2xl font-bold ${isHighlighted ? "text-white" : "text-gray-900"}`}>
                                        {plan.name}
                                    </h3>
                                </div>
                                <p className={`text-sm mb-4 ${isHighlighted ? "text-blue-100" : "text-gray-600"}`}>
                                    {plan.description}
                                </p>
                                <div className="mb-6">
                                    <span className={`text-4xl font-extrabold ${isHighlighted ? "text-yellow-300" : "text-blue-600"}`}>
                                        ${plan.price}
                                    </span>
                                    {plan.price > 0 && (
                                        <span className={`text-lg ml-2 ${isHighlighted ? "text-blue-100" : "text-gray-500"}`}>
                                            /mo
                                        </span>
                                    )}
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f, idx) => (
                                        <li key={idx} className={`flex items-center gap-2 ${isHighlighted ? "text-blue-50" : "text-gray-700"}`}>
                                            <FaCheck className={`flex-shrink-0 ${isHighlighted ? "text-yellow-300" : "text-green-500"}`} /> 
                                            <span className="text-sm">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handlePlanSelect(key)}
                                    disabled={isLoading}
                                    className={`w-full py-3 sm:py-3.5 rounded-lg font-semibold text-base transition-all duration-200 touch-manipulation active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 ${
                                        isHighlighted
                                            ? "bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                                            : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg`
                                    }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>
                                                {plan.price === 0 ? "Get Started Free" : isUpgrade ? 'Upgrade to' : 'Choose Plan'}
                                            </span>
                                            {isPopular && <Crown className="w-5 h-5" />}
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )
                    })}
                        </div>

                        {/* Special Plans Section */}
                        {specialPlans.length > 0 && (
                            <div className="mt-12">
                                <motion.h3
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-900"
                                >
                                    Special Offers
                                </motion.h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {specialPlans.map((plan, index) => {
                                        const Icon = plan.icon;
                                        const isLoading = loading === plan.key;
                                        return (
                                            <motion.div
                                                key={plan.key}
                                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                                whileHover={{ y: -8, scale: 1.02 }}
                                                className={`relative p-6 sm:p-8 rounded-2xl shadow-xl transition-all duration-300 cursor-pointer border-2 border-yellow-400 bg-gradient-to-br ${plan.color} text-white`}
                                            >
                                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-semibold bg-yellow-400 text-gray-900 rounded-full shadow-lg">
                                                    ⭐ Special Offer
                                                </span>
                                                <div className="flex items-center gap-3 mb-4 text-white">
                                                    <div className={`p-3 rounded-lg bg-gradient-to-br ${plan.color} bg-opacity-20`}>
                                                        <Icon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white">
                                                        {plan.name}
                                                    </h3>
                                                </div>
                                                <p className="text-sm mb-4 text-blue-100">
                                                    {plan.description}
                                                </p>
                                                <div className="mb-6">
                                                    <span className="text-4xl font-extrabold text-yellow-300">
                                                        ${plan.price}
                                                    </span>
                                                    {plan.price > 0 && (
                                                        <span className="text-lg ml-2 text-blue-100">
                                                            /{plan.durationDays} days
                                                        </span>
                                                    )}
                                                </div>
                                                <ul className="space-y-3 mb-8">
                                                    {plan.features.map((f: string, idx: number) => (
                                                        <li key={idx} className="flex items-center gap-2 text-blue-50">
                                                            <FaCheck className="flex-shrink-0 text-yellow-300" /> 
                                                            <span className="text-sm">{f}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button
                                                    onClick={() => handlePlanSelect(plan.key)}
                                                    disabled={isLoading}
                                                    className="w-full py-3 sm:py-3.5 rounded-lg font-semibold text-base transition-all duration-200 touch-manipulation active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 bg-white text-indigo-600 hover:bg-gray-100 shadow-lg"
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                            <span>Processing...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>
                                                                {plan.price === 0 ? "Get Started Free" : isUpgrade ? 'Upgrade to' : 'Choose Plan'}
                                                            </span>
                                                        </>
                                                    )}
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    )
}
