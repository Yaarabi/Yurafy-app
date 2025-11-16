"use client";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useMessages } from "next-intl";
import { FaCheck } from "react-icons/fa";
import { Zap, Store, MessageCircle, Bot, Crown, Sparkles } from "lucide-react";

// Enforce English plan keys & names
type PlanKey = 'free' | 'starter' | 'whatsapp' | 'aiAgent' | 'proSeller' | 'visionary';
const planNamesEn: Record<PlanKey, string> = {
    free: 'Free',
    starter: 'Starter',
    whatsapp: 'WhatsApp Automation',
    aiAgent: 'AI WhatsApp Agent',
    proSeller: 'Pro Seller',
    visionary: 'Visionary',
};

// Default plans
const defaultPlans = [
    {
        key: "free",
        icon: Zap,
        color: "from-gray-400 to-gray-600",
    },
    {
        key: "starter",
        icon: Store,
        color: "from-blue-400 to-blue-600",
    },
    {
        key: "whatsapp",
        icon: MessageCircle,
        color: "from-green-400 to-green-600",
    },
    {
        key: "aiAgent",
        icon: Bot,
        color: "from-blue-500 to-blue-600",
    },
    {
        key: "proSeller",
        icon: Crown,
        color: "from-yellow-400 to-orange-600",
        popular: true,
    },
    {
        key: "visionary",
        icon: Sparkles,
        color: "from-blue-500 to-blue-700",
        highlighted: true,
    },
];

export default function PlansSection() {
    const t = useTranslations("PlansSection");
    const messages = useMessages() as any;
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'en';
    const isRTL = locale === 'ar';
    const langNS = "PlansSection";

    const handlePlanClick = (planKey: string) => {
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
                    {t("subtitle")}
                </motion.p>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {defaultPlans.map((plan, i) => {
                        const { key, icon: Icon, color, highlighted, popular } = plan as { key: PlanKey, icon: any, color: string, highlighted?: boolean, popular?: boolean };
                        // Name should always be English
                        const name = planNamesEn[key];
                        const price = t(`${key}.price`);
                        const description = t(`${key}.description`);
                        // Build features from messages object to avoid missing-key lookups
                        const ns = (messages?.PlansSection ?? {}) as Record<string, any>;
                        const planNode = (ns?.[key] ?? {}) as Record<string, any>;
                        const featuresObj = (planNode?.features ?? {}) as Record<string, string>;
                        const features = Object.keys(featuresObj)
                            .sort((a, b) => Number(a) - Number(b))
                            .map((k) => String(featuresObj[k]))
                            .filter(Boolean);
                        
                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="relative group"
                            >
                                {(highlighted || popular) && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                                            ⭐ {highlighted ? t("bestValue") : t("popular")}
                                        </span>
                                    </div>
                                )}
                                <div className={`h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[var(--brand-blue)] ${isRTL ? 'text-right' : ''}`}>
                                    {/* Header with icon and title */}
                                    <div className={`bg-gradient-to-r from-[var(--brand-blue)] to-blue-600 p-6 text-white ${isRTL ? 'text-right' : ''}`}>
                                        <Icon className={`w-12 h-12 mb-4 ${isRTL ? 'mr-auto' : ''}`} />
                                        <h3 className="text-2xl font-bold mb-2">{name}</h3>
                                        <p className="text-white/90 text-sm">{description}</p>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className={`p-6 ${isRTL ? 'text-right' : ''}`}>
                                        {/* Price */}
                                        <div className="mb-6">
                                            <div className={`text-4xl font-bold text-gray-900 dark:text-white ${isRTL ? 'flex flex-row-reverse items-baseline gap-2' : ''}`}>
                                                {isRTL ? (
                                                    <>
                                                        {price !== "0" && (
                                                            <span className="text-lg text-gray-500 dark:text-gray-400">
                                                                /{t("perMonth")}
                                                            </span>
                                                        )}
                                                        <span>${price}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        ${price}
                                                        {price !== "0" && (
                                                            <span className="text-lg text-gray-500 dark:text-gray-400 ml-2">
                                                                /{t("perMonth")}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Features */}
                                        <ul className="space-y-3 mb-6">
                                            {features.map((f: string, idx: number) => (
                                                <li key={idx} className={`flex items-start gap-2 text-gray-700 dark:text-gray-300 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                                                    <FaCheck className={`w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                                                    <span className="text-sm">{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        {/* Button */}
                                        <button
                                            onClick={() => handlePlanClick(key)}
                                            className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group hover:opacity-90"
                                            style={{ background: 'linear-gradient(to right, var(--brand-blue), #1e40af)' }}
                                        >
                                            {price === "0" ? t("getStartedFree") : t("choosePlan")}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
