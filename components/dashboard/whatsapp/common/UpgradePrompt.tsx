'use client';
import { motion } from "framer-motion";
import { Sparkles, ArrowUpCircle } from "lucide-react";
import Link from "next/link";

interface UpgradePromptProps {
    icon: React.ElementType;
    title: string;
    description: string;
    plans: Array<{ name: string; description: string }>;
}

export default function UpgradePrompt({ icon: Icon, title, description, plans }: UpgradePromptProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center py-12"
        >
            <div className="w-20 h-20 bg-[var(--brand-blue)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Icon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                {description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                {plans.map((plan, index) => (
                    <div 
                        key={index}
                        className="bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 border-2 border-[var(--brand-blue)]/30 dark:border-[var(--brand-blue)]/50 rounded-lg px-6 py-4"
                    >
                        <div className="font-semibold text-[var(--brand-blue)] dark:text-[var(--brand-blue)]">
                            {plan.name}
                        </div>
                        <div className="text-sm text-[var(--brand-blue)]/80 dark:text-[var(--brand-blue)]/70">
                            {plan.description}
                        </div>
                    </div>
                ))}
            </div>
            <Link
                href="/onboarding/upgrade"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand-blue)] text-white rounded-lg font-semibold hover:bg-[var(--brand-blue)]/90 transition-all shadow-lg hover:shadow-xl"
            >
                <ArrowUpCircle className="w-5 h-5" />
                Upgrade Now
            </Link>
        </motion.div>
    );
}
