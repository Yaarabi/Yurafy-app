"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface UserFeaturesData {
    user: {
        id: string;
        username: string;
        email: string;
        phone?: string;
        logo?: string;
        role: string;
        plan: string;
        active: boolean;
        onboardingCompleted: boolean;
    };
    features: {
        store: any | null;
        whatsapp: any | null;
        aiAgent: any | null;
    };
    plan: {
        planKey: string;
        currentPlan: {
            planName: string;
            startDate: Date;
            endDate: Date;
            status: string;
        } | null;
        isExpired: boolean;
        limits: {
            maxProducts?: number;
            maxOrders?: number;
            maxContacts?: number;
        };
        usage: {
            products: number;
            orders: number;
            contacts: number;
        };
    };
    statistics: {
        totalRevenue: number;
        productsCount: number;
        ordersCount: number;
        templatesCount: number;
        ordersByStatus: Record<string, number>;
        revenueByDate: Record<string, number>;
        topProducts: Array<{
            name: string;
            price: number;
            salesCount: number;
        }>;
        recentOrders: any[];
    };
    planFeatures: {
        hasStore: boolean;
        hasWhatsApp: boolean;
        hasAIAgent: boolean;
        isStorePlan: boolean;
        isWhatsAppPlan: boolean;
        hasOrders: boolean;
        ai?: {
            enabled: boolean;
        };
    };
}

export function useUserFeatures() {
    const { data: session, status } = useSession();
    const [data, setData] = useState<UserFeaturesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFeatures = useCallback(async () => {
        if (status === 'loading') return;
        if (status === 'unauthenticated' || !session?.user?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/user/features');
            
            if (!response.ok) {
                throw new Error('Failed to fetch user features');
            }

            const result = await response.json();
            
            if (result.success) {
                setData(result);
            } else {
                throw new Error(result.error || 'Failed to fetch user features');
            }
        } catch (err) {
            console.error('Error fetching user features:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch user features');
        } finally {
            setLoading(false);
        }
    }, [status, session?.user?.id]); // Memoize with stable dependencies

    useEffect(() => {
        fetchFeatures();
    }, [fetchFeatures]); // Now we can safely depend on fetchFeatures since it's memoized

    return { data, loading, error, refetch: fetchFeatures };
}

