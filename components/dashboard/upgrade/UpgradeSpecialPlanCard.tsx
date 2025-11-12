"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowUpCircle } from "lucide-react";
import { FaCheck } from "react-icons/fa";

interface UpgradeSpecialPlanCardProps {
    plan: {
        key: string;
        name: string;
        price: number;
        description: string;
        icon: any;
        color: string;
        features: string[];
        durationDays: number;
    };
    index: number;
    isLoading: boolean;
    currentPlanKey?: string;
    onSelect: (planKey: string) => void;
}

export default function UpgradeSpecialPlanCard({
    plan,
    index,
    isLoading,
    currentPlanKey,
    onSelect,
}: UpgradeSpecialPlanCardProps) {
    const Icon = plan.icon;
    const isCurrent = currentPlanKey?.toLowerCase() === plan.key.toLowerCase();

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={!isCurrent ? { y: -8, scale: 1.02 } : {}}
            className={`relative p-6 sm:p-8 rounded-2xl shadow-xl transition-all duration-300 border-2 ${
                isCurrent
                    ? "bg-gray-100 border-gray-300 opacity-75"
                    : `border-yellow-400 bg-gradient-to-br ${plan.color} text-white cursor-pointer`
            }`}
        >
            {/* Current Plan Badge */}
            {isCurrent && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-semibold bg-gray-500 text-white rounded-full shadow-lg flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Current Plan
                </span>
            )}

            {/* Special Offer Badge */}
            {!isCurrent && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-semibold bg-yellow-400 text-gray-900 rounded-full shadow-lg">
                    ⭐ Special Offer
                </span>
            )}

            {/* Plan Header */}
            <div className="flex items-center gap-3 mb-4 text-white">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${plan.color} bg-opacity-20`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
            </div>

            {/* Description */}
            <p className="text-sm mb-4 text-blue-100">{plan.description}</p>

            {/* Price */}
            <div className="mb-6">
                <span className="text-4xl font-extrabold text-yellow-300">
                    ${plan.price}
                </span>
                <span className="text-lg ml-2 text-blue-100">
                    /{plan.durationDays} days
                </span>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
                {plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-blue-50">
                        <FaCheck className="flex-shrink-0 text-yellow-300" />
                        <span className="text-sm">{feature}</span>
                    </li>
                ))}
            </ul>

            {/* Action Button */}
            <button
                onClick={() => !isCurrent && onSelect(plan.key)}
                disabled={isLoading || isCurrent}
                className={`w-full py-3 sm:py-3.5 rounded-lg font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                    isCurrent
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-white text-indigo-600 hover:bg-gray-100 shadow-lg active:scale-95"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
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
                    </>
                )}
            </button>
        </motion.div>
    );
}
