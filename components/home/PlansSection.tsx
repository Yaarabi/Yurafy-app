"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { FaCheck } from "react-icons/fa";
import { Zap, Store, MessageCircle, Bot, Crown, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

// Icon mapping for plan templates
const iconMap: Record<string, any> = {
    zap: Zap,
    store: Store,
    messagecircle: MessageCircle,
    bot: Bot,
    crown: Crown,
    sparkles: Sparkles,
};

// Default plans fallback
const defaultPlans = [
        {
            key: "free",
            name: "Free",
            price: 0,
            description: "Test all features with limited usage.",
            icon: Zap,
            color: "from-gray-400 to-gray-600",
            features: ["5 Products", "10 Orders", "Basic Support"],
        },
        {
            key: "starter",
            name: "Starter",
            price: 11,
            description: "Basic store setup with branding and domain.",
            icon: Store,
            color: "from-blue-400 to-blue-600",
            features: ["500 Orders", "Custom Domain", "Custom Theme", "SEO Tools"],
        },
        {
            key: "whatsapp",
            name: "WhatsApp Automation",
            price: 11,
            description: "Automate messaging with WhatsApp Cloud API.",
            icon: MessageCircle,
            color: "from-green-400 to-green-600",
            features: ["500 Contacts", "Auto Replies", "Templates", "Broadcasts"],
        },
        {
            key: "aiAgent",
            name: "AI WhatsApp Agent",
            price: 21,
            description: "Automation + AI-powered WhatsApp assistant.",
            icon: Bot,
            color: "from-blue-500 to-blue-600",
            features: ["1000 Contacts", "AI Assistant", "Smart Replies", "Multi-language"],
        },
        {
            key: "proSeller",
            name: "Pro Seller",
            price: 25,
            description: "Starter + WhatsApp Automation for serious sellers.",
            icon: Crown,
            color: "from-yellow-400 to-orange-600",
            features: ["1500 Orders", "Store + WhatsApp", "2000 Contacts", "Priority Support"],
            popular: true,
        },
        {
            key: "visionary",
            name: "Visionary",
            price: 50,
            description: "Pro Seller + AI Agent for full power scaling.",
            icon: Sparkles,
            color: "from-blue-500 to-blue-700",
            features: ["Unlimited Orders", "All Features", "AI Agent", "Priority Support"],
            highlighted: true,
        },
    ];

export default function PlansSection() {
    const t = useTranslations("PlansSection");
    const router = useRouter();
    const params = useParams();
    const [plans, setPlans] = useState(defaultPlans);
    const [specialPlans, setSpecialPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch('/api/plans?includeSpecial=true');
                if (res.ok) {
                    const data = await res.json();
                    // Convert plan templates to display format
                    const regularPlans = (data.plans || []).map((template: any) => ({
                        key: template.planKey,
                        name: template.name,
                        price: template.defaultPrice,
                        description: template.description,
                        icon: iconMap[template.icon?.toLowerCase() || 'store'] || Store,
                        color: template.color || 'from-blue-400 to-blue-600',
                        features: extractFeatures(template.features),
                        popular: template.planKey === 'proSeller',
                        highlighted: template.planKey === 'visionary',
                    }));
                    
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

                    if (regularPlans.length > 0) {
                        setPlans(regularPlans);
                    }
                    setSpecialPlans(special);
                }
            } catch (err) {
                console.error('Failed to fetch plans:', err);
                // Use default plans on error
            } finally {
                setLoading(false);
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

    const handlePlanClick = (planKey: string) => {
        const locale = params.locale || 'en';
        // Redirect to signup page with plan parameter
        router.push(`/${locale}/signup?plan=${planKey}`);
    };

    return (
        <section id="pricing" className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-blue-50 overflow-hidden">
            {/* Geometric shapes - Smart/tech inspired */}
            {/* Hexagon grid pattern */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                    <defs>
                        <pattern id="hexagons" width="40" height="40" patternUnits="userSpaceOnUse">
                            <polygon points="20,5 35,12.5 35,27.5 20,35 5,27.5 5,12.5" fill="none" stroke="#0ea5e9" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hexagons)" />
                </svg>
            </div>
            
            {/* Floating hexagons */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 0.1, y: 0, rotate: [0, 360] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 right-1/5 w-16 h-16 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" />
                </svg>
            </motion.div>
            
            {/* Circuit nodes */}
            <div className="absolute top-1/2 left-1/6 w-3 h-3 bg-blue-600/30 rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/6 w-3 h-3 bg-blue-600/30 rounded-full"></div>
            
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                <line x1="16%" y1="50%" x2="25%" y2="50%" stroke="#0ea5e9" strokeWidth="1.5" />
                <line x1="83%" y1="75%" x2="75%" y2="75%" stroke="#0ea5e9" strokeWidth="1.5" />
            </svg>
            
            {/* Y shape for Yurafy */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.08, scale: 1 }}
                transition={{ duration: 2, delay: 0.3 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M50,10 L50,50 L30,70 L50,50 L70,70" stroke="#0ea5e9" strokeWidth="2" fill="none" />
                </svg>
            </motion.div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4 text-gray-900"
                >
                    {t("title")}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-center text-gray-600 mb-8 sm:mb-12 text-base sm:text-lg px-2"
                >
                    Choose the perfect plan for your business needs
                </motion.p>
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-[var(--brand-blue)] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* Regular Plans */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {plans.map((plan, i) => {
                                const { key, name, price, description, icon: Icon, color, features, highlighted, popular } = plan;
                        return (
                            <motion.div
                                key={key}
                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                whileInView={{ scale: 1, opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className={`relative p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl transition-all duration-300 cursor-pointer
                                    ${highlighted
                                        ? `bg-gradient-to-br ${color} text-white border-2 border-transparent`
                                        : "bg-white border-2 border-gray-200 hover:border-blue-400"
                                    }`}
                                >
                                {(highlighted || popular) && (
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-semibold bg-yellow-400 text-gray-900 rounded-full shadow-lg">
                                        {highlighted ? "⭐ Best Value" : "⭐ Popular"}
                                    </span>
                                )}
                                <div className={`flex items-center gap-3 mb-4 ${highlighted ? "text-white" : "text-gray-900"}`}>
                                    <div className={`p-3 rounded-lg bg-gradient-to-br ${color} bg-opacity-10 ${highlighted ? "bg-opacity-20" : ""}`}>
                                        <Icon className={`w-6 h-6 ${highlighted ? "text-white" : `text-gradient-to-r ${color.split(' ')[1]}`}`} />
                                    </div>
                                    <h3 className={`text-2xl font-bold ${highlighted ? "text-white" : "text-gray-900"}`}>
                                        {name}
                                    </h3>
                                </div>
                                <p className={`text-sm mb-4 ${highlighted ? "text-blue-100" : "text-gray-600"}`}>
                                    {description}
                                </p>
                                <div className="mb-6">
                                    <span className={`text-4xl font-extrabold ${highlighted ? "text-yellow-300" : ""}`} style={!highlighted ? { color: 'var(--brand-blue)' } : undefined}>
                                        ${price}
                                    </span>
                                    {price > 0 && (
                                        <span className={`text-lg ml-2 ${highlighted ? "text-blue-100" : "text-gray-500"}`}>
                                            /mo
                                        </span>
                                    )}
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {features.map((f, idx) => (
                                        <li key={idx} className={`flex items-center gap-2 ${highlighted ? "text-blue-50" : "text-gray-700"}`}>
                                            <FaCheck className={`flex-shrink-0 ${highlighted ? "text-yellow-300" : "text-green-500"}`} /> 
                                            <span className="text-sm">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handlePlanClick(key)}
                                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                                        highlighted
                                            ? "bg-white hover:bg-gray-100 shadow-lg"
                                            : `bg-gradient-to-r ${color} text-white hover:shadow-lg`
                                    }`}
                                    style={highlighted ? { color: 'var(--brand-blue)' } : undefined}
                                >
                                    {price === 0 ? "Get Started Free" : "Choose Plan"}
                                </button>
                            </motion.div>
                        );
                    })}
                        </div>

                        {/* Special Plans Section */}
                        {specialPlans.length > 0 && (
                            <div className="mt-12 sm:mt-16">
                                <motion.h3
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-900"
                                >
                                    Special Offers
                                </motion.h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {specialPlans.map((plan, i) => {
                                        const { key, name, price, description, icon: Icon, color, features, durationDays } = plan;
                                        return (
                                            <motion.div
                                                key={key}
                                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                                whileInView={{ scale: 1, opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                                whileHover={{ y: -8, scale: 1.02 }}
                                                className={`relative p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl transition-all duration-300 cursor-pointer border-2 border-yellow-400 bg-gradient-to-br ${color} text-white`}
                                            >
                                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-semibold bg-yellow-400 text-gray-900 rounded-full shadow-lg">
                                                    ⭐ Special Offer
                                                </span>
                                                <div className="flex items-center gap-3 mb-4 text-white">
                                                    <div className={`p-3 rounded-lg bg-gradient-to-br ${color} bg-opacity-20`}>
                                                        <Icon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white">
                                                        {name}
                                                    </h3>
                                                </div>
                                                <p className="text-sm mb-4 text-blue-100">
                                                    {description}
                                                </p>
                                                <div className="mb-6">
                                                    <span className="text-4xl font-extrabold text-yellow-300">
                                                        ${price}
                                                    </span>
                                                    {price > 0 && (
                                                        <span className="text-lg ml-2 text-blue-100">
                                                            /{durationDays} days
                                                        </span>
                                                    )}
                                                </div>
                                                <ul className="space-y-3 mb-8">
                                                    {features.map((f, idx) => (
                                                        <li key={idx} className="flex items-center gap-2 text-blue-50">
                                                            <FaCheck className="flex-shrink-0 text-yellow-300" /> 
                                                            <span className="text-sm">{f}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button
                                                    onClick={() => handlePlanClick(key)}
                                                    className="w-full py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 bg-white hover:bg-gray-100 shadow-lg"
                                                    style={{ color: 'var(--brand-blue)' }}
                                                >
                                                    Choose Plan
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
