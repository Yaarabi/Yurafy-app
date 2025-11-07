"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { FaCheck } from "react-icons/fa";
import { Zap, Store, MessageCircle, Bot, Crown, Sparkles } from "lucide-react";

export default function PlansSection() {
    const t = useTranslations("PlansSection");
    const router = useRouter();
    const params = useParams();

    // ✅ FIXED: Use same plans as onboarding
    const plans = [
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
            features: ["1500 Orders", "Store + WhatsApp", "2000 Contacts", "Custom CSS/JS", "Priority Support"],
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

    const handlePlanClick = (planKey: string) => {
        const locale = params.locale || 'en';
        // Redirect to signup page with plan parameter
        router.push(`/${locale}/signup?plan=${planKey}`);
    };

    return (
        <section id="pricing" className="relative py-20 bg-gradient-to-b from-gray-50 to-blue-50 overflow-hidden">
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
            
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4 text-gray-900"
                >
                    {t("title")}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-center text-gray-600 mb-12 text-lg"
                >
                    Choose the perfect plan for your business needs
                </motion.p>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                className={`relative p-8 rounded-2xl shadow-xl transition-all duration-300 cursor-pointer
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
                                    <span className={`text-4xl font-extrabold ${highlighted ? "text-yellow-300" : "text-blue-600"}`}>
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
                                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105
                                        ${highlighted
                                            ? "bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                                            : `bg-gradient-to-r ${color} text-white hover:shadow-lg`
                                        }`}
                                >
                                    {price === 0 ? "Get Started Free" : "Choose Plan"}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
