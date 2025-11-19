'use client';
import { Crown, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PlanSettingsProps {
    plan: {
        planKey?: string;
        currentPlan?: { endDate?: string };
        isExpired?: boolean;
    };
    locale: string;
}

export default function PlanSettings({ plan, locale }: PlanSettingsProps) {
    const planKey = plan?.planKey?.toLowerCase() || 'free';
    const isVisionary = planKey === 'visionary';
    const showUpgrade = !isVisionary;
    const showRenew = plan?.isExpired && isVisionary;

    return (
        <div className="space-y-3 sm:space-y-6">
            {/* Current Plan Display */}
            <div className="bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-xl p-4 sm:p-6 border border-[var(--brand-blue)]/30 dark:border-[var(--brand-blue)]/40">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="p-3 bg-[var(--brand-blue)] rounded-xl shadow-lg flex-shrink-0">
                        {planKey === 'free' ? (
                            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        ) : (
                            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            Current Plan: {plan?.planKey || 'Free'}
                        </h3>
                        {plan?.currentPlan?.endDate && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Expires: {new Date(plan.currentPlan.endDate).toLocaleDateString()}
                            </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                            {planKey === 'free'
                                ? 'You are on the free plan. Upgrade to unlock more features!'
                                : 'Manage your subscription and explore upgrade options.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            {(showUpgrade || showRenew) && (
                <div className="flex justify-center">
                    <Link
                        href={`/${locale}/onboarding/upgrade`}
                        className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[var(--brand-blue)] text-white font-semibold rounded-xl hover:bg-[var(--brand-blue)]/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto justify-center"
                    >
                        <Crown className="w-5 h-5" />
                        <span className="text-sm sm:text-base">{showRenew ? 'Renew Plan' : 'Upgrade Plan'}</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            )}

            {/* Plan Info */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                    Click "Upgrade Plan" to view all available plans and choose the one that best fits your needs.
                </p>
            </div>
        </div>
    );
}
