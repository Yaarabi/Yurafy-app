"use client";

import { motion } from "framer-motion";
import { Crown, CheckCircle, ArrowUpCircle } from "lucide-react";
import { FaCheck } from "react-icons/fa";

interface UpgradePlanCardProps {
    planKey: string;
    plan: {
        name: string;
        price: number;
        description: string;
        icon: any;
        color: string;
        features: string[];
    };
    index: number;
    isLoading: boolean;
    isPopular?: boolean;
    isHighlighted?: boolean;
    currentPlanKey?: string;
    onSelect: (planKey: string) => void;
}

export default function UpgradePlanCard({
    planKey,
    plan,
    index,
    isLoading,
    isPopular = false,
    isHighlighted = false,
    currentPlanKey,
    onSelect,
}: UpgradePlanCardProps) {
    const Icon = plan.icon;
    const isCurrent = currentPlanKey?.toLowerCase() === planKey.toLowerCase();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group"
        >
            {/* Current Plan Badge */}
            {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-gray-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Current Plan
                    </span>
                </div>
            )}

            {/* Popular/Best Value Badge */}
            {!isCurrent && (isHighlighted || isPopular) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                        ⭐ {isHighlighted ? "Best Value" : "Popular"}
                    </span>
                </div>
            )}

            <div className={`h-full rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
                isCurrent 
                    ? "bg-gray-100 border-gray-300 opacity-75" 
                    : "bg-white dark:bg-gray-800 border-transparent hover:border-[var(--brand-blue)] cursor-pointer"
            }`}>
                {/* Header with icon and title */}
                <div className="bg-gradient-to-r from-[var(--brand-blue)] to-blue-600 p-6 text-white">
                    <Icon className="w-12 h-12 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-white/90 text-sm">{plan.description}</p>
                </div>
                
                {/* Content */}
                <div className="p-6">
                    {/* Price */}
                    <div className="mb-6">
                        <div className="text-4xl font-bold text-gray-900 dark:text-white">
                            ${plan.price}
                            <span className="text-lg text-gray-500 dark:text-gray-400 ml-2">
                                /mo
                            </span>
                        </div>
                    </div>
                    
                    {/* Features */}
                    <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                <FaCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>
                    
                    {/* Action Button */}
                    <button
                        onClick={() => !isCurrent && onSelect(planKey)}
                        disabled={isLoading || isCurrent}
                        className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                            isCurrent
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "text-white hover:opacity-90 active:scale-95"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        style={!isCurrent ? { background: 'linear-gradient(to right, var(--brand-blue), #1e40af)' } : undefined}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </>
                        ) : isCurrent ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                <span>Current Plan</span>
                            </>
                        ) : (
                            <>
                                <ArrowUpCircle className="w-5 h-5" />
                                <span>Upgrade Now</span>
                                {isPopular && <Crown className="w-5 h-5" />}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
