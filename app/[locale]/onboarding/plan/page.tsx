"use client";
import { motion } from "framer-motion"
import { Sparkles, Crown } from "lucide-react"
import { useParams } from "next/navigation"
import PlanCard from "@/components/onboarding/plan/PlanCard"
import { usePlansData } from "@/hooks/onboarding/usePlansData"
import { useUpgradeMode } from "@/hooks/onboarding/useUpgradeMode"
import { usePlanSelection } from "@/hooks/onboarding/usePlanSelection"

export default function PlanPage() {
    const params = useParams()
    const isUpgrade = useUpgradeMode()
    const { plans, loading: plansLoading } = usePlansData()
    const { loading, handlePlanSelect } = usePlanSelection(isUpgrade)

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
                            className="mt-4 flex flex-col gap-2 items-center"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium">
                                <Crown className="w-4 h-4" />
                                <span>Upgrade Mode: Features will be set up automatically</span>
                            </div>
                            <p className="text-xs text-gray-500">
                                Looking for a cleaner upgrade experience?{" "}
                                <a href={`/${(params.locale || 'en')}/onboarding/upgrade`} className="text-indigo-600 hover:text-indigo-700 font-medium underline">
                                    Use our dedicated upgrade page
                                </a>
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {Object.entries(plans)
                        .filter(([key]) => !(isUpgrade && key === 'free')) // Hide free plan during upgrade
                        .map(([key, plan], index) => (
                            <PlanCard
                                key={key}
                                planKey={key}
                                plan={plan as any}
                                index={index}
                                isLoading={loading === key}
                                isPopular={key === 'proSeller'}
                                isHighlighted={key === 'visionary'}
                                isUpgrade={isUpgrade}
                                onSelect={handlePlanSelect}
                            />
                        ))}
                        </div>

            </motion.div>
        </div>
    )
}
