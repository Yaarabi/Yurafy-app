'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Lock, Upgrade, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PlanProtectionProps {
    children: ReactNode;
    requiredFeature: string;
    planName?: string;
}

export default function PlanProtection({ 
    children, 
    requiredFeature,
    planName 
}: PlanProtectionProps) {
    const { data: session } = useSession();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

    useEffect(() => {
        async function checkAccess() {
            if (!session?.user?.id) {
                setHasAccess(false);
                setError('Please sign in to access this feature');
                return;
            }

            try {
                const response = await fetch(`/api/plan/check-access?feature=${requiredFeature}`);
                const data = await response.json();

                if (data.hasAccess) {
                    setHasAccess(true);
                    if (data.daysRemaining !== undefined) {
                        setDaysRemaining(data.daysRemaining);
                    }
                } else {
                    setHasAccess(false);
                    setError(data.error || 'Access denied');
                }
            } catch (err) {
                console.error('Plan access check error:', err);
                setHasAccess(false);
                setError('Failed to verify access');
            }
        }

        checkAccess();
    }, [session, requiredFeature]);

    if (hasAccess === null) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Feature Not Available</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    
                    {daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 text-yellow-800">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-medium">Your plan expires in {daysRemaining} day(s)</span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/dashboard/settings?tab=plan"
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                        >
                            <Upgrade className="w-5 h-5 inline-block mr-2" />
                            Upgrade Plan
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <>
            {daysRemaining !== null && daysRemaining <= 30 && (
                <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                            Your plan expires in {daysRemaining} day(s). 
                            <Link href="/dashboard/settings?tab=plan" className="underline ml-1">Renew now</Link>
                        </p>
                    </div>
                </div>
            )}
            {children}
        </>
    );
}

