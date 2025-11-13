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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group"
        >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ Special Offer
                </span>
            </div>
            <div className="h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-yellow-400 hover:border-[var(--brand-blue)] cursor-pointer touch-manipulation">
                {/* Header with icon and title */}
                <div className="p-6 text-white" style={{ background: 'linear-gradient(to right, var(--brand-blue), #1e40af)' }}>
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
                            {plan.price > 0 && (
                                <span className="text-lg text-gray-500 dark:text-gray-400 ml-2">
                                    /{plan.durationDays} days
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {/* Features */}
                    <ul className="space-y-3 mb-6">
                        {plan.features.map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                <FaCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>
                    
                    {/* Button */}
                    <button
                        onClick={() => onSelect(plan.key)}
                        disabled={isLoading}
                        className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
                        style={{ background: 'linear-gradient(to right, var(--brand-blue), #1e40af)' }}
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
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
