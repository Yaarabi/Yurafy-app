import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface StoreStatus {
    hasStore: boolean;
    onboardingCompleted: boolean;
    isLoading: boolean;
    error: string | null;
}

export function useStoreStatus() {
    const { data: session, status: sessionStatus } = useSession();
    const [storeStatus, setStoreStatus] = useState<StoreStatus>({
        hasStore: false,
        onboardingCompleted: false,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        const checkStoreStatus = async () => {
            if (sessionStatus === 'loading') {
                return;
            }

            if (sessionStatus === 'unauthenticated' || !session?.user?.id) {
                setStoreStatus({
                    hasStore: false,
                    onboardingCompleted: false,
                    isLoading: false,
                    error: 'Not authenticated',
                });
                return;
            }

            try {
                setStoreStatus(prev => ({ ...prev, isLoading: true, error: null }));

                // Check store existence and user onboarding status in parallel
                const [storeResponse, userResponse] = await Promise.all([
                    fetch('/api/store/owner', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    }),
                    fetch('/api/auth/refresh', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: session.user.id }),
                    }),
                ]);

                const storeData = await storeResponse.json().catch(() => ({}));
                const userData = await userResponse.json().catch(() => ({}));

                setStoreStatus({
                    hasStore: storeResponse.ok && !!storeData._id,
                    onboardingCompleted: userData.onboardingCompleted === true,
                    isLoading: false,
                    error: null,
                });
            } catch (error: any) {
                console.error('Error checking store status:', error);
                setStoreStatus({
                    hasStore: false,
                    onboardingCompleted: false,
                    isLoading: false,
                    error: error.message || 'Failed to check store status',
                });
            }
        };

        checkStoreStatus();
    }, [sessionStatus, session?.user?.id]);

    return storeStatus;
}

