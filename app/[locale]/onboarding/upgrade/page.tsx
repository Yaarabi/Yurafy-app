"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Crown, Zap } from "lucide-react";
import { usePlansData } from "@/hooks/onboarding/usePlansData";
import { useUpgradePlanSelection } from "@/hooks/dashboard/useUpgradePlanSelection";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import UpgradePlanCard from "@/components/dashboard/upgrade/UpgradePlanCard";
import UpgradeSpecialPlanCard from "@/components/dashboard/upgrade/UpgradeSpecialPlanCard";

/**
 * Onboarding Upgrade Page
 * Used during onboarding flow when user wants to upgrade their plan
 * Redirects to dashboard upgrade page for better UX
 */
export default function OnboardingUpgradePage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const { plans, specialPlans, loading: plansLoading } = usePlansData();
    const { loading, currentPlan, handlePlanSelect } = useUpgradePlanSelection();

    // If the user is unauthenticated, send them to login.
    // If authenticated, stay on this onboarding upgrade page (it is the canonical upgrade UI).
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/${params.locale}/login`);
        }
    }, [status, router, params.locale]);

    if (status === "loading" || plansLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Redirecting to upgrade page...</p>
                </div>
            </div>
        );
    }

    // This will rarely be seen as we redirect immediately
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.push(`/${params.locale}/onboarding/plan`)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back to Plans</span>
                </motion.button>

                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block mb-4"
                    >
                        <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-600 mx-auto" />
                    </motion.div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4">
                        Upgrade Your Plan
                    </h1>
                    
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-4">
                        Choose a higher plan to unlock more features and grow your business
                    </p>

                    {/* Current Plan Badge */}
                    {currentPlan && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-indigo-200 rounded-xl shadow-sm"
                        >
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                            <span className="text-sm sm:text-base">
                                <span className="text-gray-600">Current Plan:</span>{" "}
                                <span className="font-bold text-indigo-600">{currentPlan.name}</span>
                            </span>
                        </motion.div>
                    )}

                    {/* Info Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs sm:text-sm font-medium"
                    >
                        <Crown className="w-4 h-4" />
                        <span>Missing features will be set up automatically after payment</span>
                    </motion.div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                    {Object.entries(plans)
                        .filter(([key]) => {
                            // Hide free plan and current plan during upgrade
                            if (key === 'free') return false;
                            if (currentPlan && key.toLowerCase() === currentPlan.planKey?.toLowerCase()) return false;
                            return true;
                        })
                        .map(([key, plan], index) => (
                            <UpgradePlanCard
                                key={key}
                                planKey={key}
                                plan={plan as any}
                                index={index}
                                isLoading={loading === key}
                                isPopular={key === 'proSeller'}
                                isHighlighted={key === 'visionary'}
                                currentPlanKey={currentPlan?.planKey}
                                onSelect={handlePlanSelect}
                            />
                        ))}
                </div>

                {/* Special Plans Section */}
                {specialPlans.length > 0 && (
                    <div className="mt-12">
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-900"
                        >
                            Special Offers
                        </motion.h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {specialPlans
                                .filter(plan => {
                                    // Hide current plan
                                    if (currentPlan && plan.key.toLowerCase() === currentPlan.planKey?.toLowerCase()) return false;
                                    return true;
                                })
                                .map((plan, index) => (
                                    <UpgradeSpecialPlanCard
                                        key={plan.key}
                                        plan={plan}
                                        index={index}
                                        isLoading={loading === plan.key}
                                        currentPlanKey={currentPlan?.planKey}
                                        onSelect={handlePlanSelect}
                                    />
                                ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
