"use client"
import { motion } from "framer-motion"
import { FaCheck } from "react-icons/fa"

interface SpecialPlanCardProps {
    plan: {
        key: string
        name: string
        price: number
        description: string
        icon: any
        color: string
        features: string[]
        durationDays: number
    }
    index: number
    isLoading: boolean
    isUpgrade?: boolean
    onSelect: (planKey: string) => void
}

export default function SpecialPlanCard({
    plan,
    index,
    isLoading,
    isUpgrade = false,
    onSelect
}: SpecialPlanCardProps) {
    const Icon = plan.icon

    return (
        <motion.div
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
                {plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-blue-50">
                        <FaCheck className="flex-shrink-0 text-yellow-300" /> 
                        <span className="text-sm">{feature}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => onSelect(plan.key)}
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
    )
}
