import { useState, useEffect } from "react";

export function usePlanFetch(planKey: string | null) {
    const [plan, setPlan] = useState<any>(null);
    const [planLoading, setPlanLoading] = useState(true);
    const [planError, setPlanError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlan = async () => {
            if (!planKey) {
                setPlanLoading(false);
                return;
            }

            try {
                setPlanLoading(true);
                const res = await fetch(`/api/plans`);
                if (!res.ok) throw new Error('Failed to fetch plans');
                const data = await res.json();
                
                const allPlans = [...(data.plans || []), ...(data.specialPlans || [])];
                const foundPlan = allPlans.find((p: any) => 
                    p.planKey?.toLowerCase() === planKey?.toLowerCase() ||
                    p.name?.toLowerCase() === planKey?.toLowerCase()
                );
                
                if (foundPlan) {
                    setPlan(foundPlan);
                } else {
                    setPlanError(`Plan "${planKey}" not found`);
                }
            } catch (err) {
                console.error('Error fetching plan:', err);
                setPlanError('Failed to load plan information');
            } finally {
                setPlanLoading(false);
            }
        };
        
        fetchPlan();
    }, [planKey]);

    return { plan, planLoading, planError };
}
