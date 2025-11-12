"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface CurrentPlan {
    planKey: string;
    name: string;
    endDate?: Date;
    isExpired?: boolean;
}

export function useUpgradePlanSelection() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const [loading, setLoading] = useState<string | null>(null);
    const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);

    // Fetch current plan on mount
    useEffect(() => {
        const fetchCurrentPlan = async () => {
            try {
                const res = await fetch('/api/user');
                if (res.ok) {
                    const data = await res.json();
                    if (data.features?.plan) {
                        setCurrentPlan({
                            planKey: data.features.plan.planKey,
                            name: data.features.plan.name,
                            endDate: data.features.plan.endDate,
                            isExpired: data.features.plan.isExpired,
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching current plan:', error);
            }
        };

        fetchCurrentPlan();
    }, []);

    const handlePlanSelect = async (planKey: string) => {
        if (loading) return;

        setLoading(planKey);

        try {
            // Call upgrade API
            const response = await fetch('/api/upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planKey, locale }),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.error || 'Failed to process upgrade');
                setLoading(null);
                return;
            }

            // Show success message if resources were created
            if (result.created && result.created.length > 0) {
                toast.success(
                    `Created: ${result.created.join(', ')}`,
                    { duration: 2000 }
                );
            }

            // Redirect to the appropriate page
            if (result.redirectTo) {
                // Small delay for better UX
                setTimeout(() => {
                    router.push(result.redirectTo);
                }, 500);
            }
        } catch (error) {
            console.error('Upgrade error:', error);
            toast.error('An unexpected error occurred. Please try again.');
            setLoading(null);
        }
    };

    return {
        loading,
        currentPlan,
        handlePlanSelect,
    };
}
