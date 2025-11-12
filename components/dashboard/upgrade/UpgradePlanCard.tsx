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
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={!isCurrent ? { y: -8, scale: 1.02 } : {}}
            className={`relative p-6 sm:p-8 rounded-2xl shadow-xl transition-all duration-300 ${
                isCurrent
                    ? "bg-gray-100 border-2 border-gray-300 opacity-75"
                    : isHighlighted
                    ? `bg-gradient-to-br ${plan.color} text-white border-2 border-transparent cursor-pointer`
                    : "bg-white border-2 border-gray-200 hover:border-blue-400 cursor-pointer"
            }`}
        >
            {/* Current Plan Badge */}
            {isCurrent && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-semibold bg-gray-500 text-white rounded-full shadow-lg flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Current Plan
                </span>
            )}

            {/* Popular/Best Value Badge */}
            {!isCurrent && (isHighlighted || isPopular) && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-semibold bg-yellow-400 text-gray-900 rounded-full shadow-lg">
                    {isHighlighted ? "⭐ Best Value" : "⭐ Popular"}
                </span>
            )}

            {/* Plan Header */}
            <div
                className={`flex items-center gap-3 mb-4 ${
                    isHighlighted ? "text-white" : "text-gray-900"
                }`}
            >
                <div
                    className={`p-3 rounded-lg bg-gradient-to-br ${plan.color} ${
                        isHighlighted ? "bg-opacity-20" : "bg-opacity-10"
                    }`}
                >
                    <Icon
                        className={`w-6 h-6 ${
                            isHighlighted
                                ? "text-white"
                                : `text-gradient-to-r ${plan.color.split(" ")[1]}`
                        }`}
                    />
                </div>
                <h3
                    className={`text-2xl font-bold ${
                        isHighlighted ? "text-white" : "text-gray-900"
                    }`}
                >
                    {plan.name}
                </h3>
            </div>

            {/* Description */}
            <p
                className={`text-sm mb-4 ${
                    isHighlighted ? "text-blue-100" : "text-gray-600"
                }`}
            >
                {plan.description}
            </p>

            {/* Price */}
            <div className="mb-6">
                <span
                    className={`text-4xl font-extrabold ${
                        isHighlighted ? "text-yellow-300" : "text-blue-600"
                    }`}
                >
                    ${plan.price}
                </span>
                <span
                    className={`text-lg ml-2 ${
                        isHighlighted ? "text-blue-100" : "text-gray-500"
                    }`}
                >
                    /mo
                </span>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                    <li
                        key={idx}
                        className={`flex items-center gap-2 ${
                            isHighlighted ? "text-blue-50" : "text-gray-700"
                        }`}
                    >
                        <FaCheck
                            className={`flex-shrink-0 ${
                                isHighlighted ? "text-yellow-300" : "text-green-500"
                            }`}
                        />
                        <span className="text-sm">{feature}</span>
                    </li>
                ))}
            </ul>

            {/* Action Button */}
            <button
                onClick={() => !isCurrent && onSelect(planKey)}
                disabled={isLoading || isCurrent}
                className={`w-full py-3 sm:py-3.5 rounded-lg font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                    isCurrent
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : isHighlighted
                        ? "bg-white text-blue-600 hover:bg-gray-100 shadow-lg active:scale-95"
                        : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg active:scale-95`
                } disabled:opacity-50 disabled:cursor-not-allowed`}
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
        </motion.div>
    );
}
