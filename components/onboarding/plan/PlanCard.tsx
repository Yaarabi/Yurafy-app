"use client"
import { motion } from "framer-motion"
import { Crown } from "lucide-react"
import { FaCheck } from "react-icons/fa"

interface PlanCardProps {
    planKey: string
    plan: {
        name: string
        price: number
        description: string
        icon: any
        color: string
        features: string[]
    }
    index: number
    isLoading: boolean
    isPopular?: boolean
    isHighlighted?: boolean
    isUpgrade?: boolean
    onSelect: (planKey: string) => void
}

export default function PlanCard({
    planKey,
    plan,
    index,
    isLoading,
    isPopular = false,
    isHighlighted = false,
    isUpgrade = false,
    onSelect
}: PlanCardProps) {
    const Icon = plan.icon

    return (
        <motion.div
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
                {plan.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-center gap-2 ${isHighlighted ? "text-blue-50" : "text-gray-700"}`}>
                        <FaCheck className={`flex-shrink-0 ${isHighlighted ? "text-yellow-300" : "text-green-500"}`} /> 
                        <span className="text-sm">{feature}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => onSelect(planKey)}
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
}
