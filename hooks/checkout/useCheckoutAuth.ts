import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useCheckoutAuth(locale: string, planKey: string | null) {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [authChecking, setAuthChecking] = useState(true);
    const [emailVerified, setEmailVerified] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const checkAuthAndVerification = async () => {
            if (sessionStatus === "loading") return;
            
            if (sessionStatus === "unauthenticated" || !session?.user?.id) {
                toast.error("Please log in to proceed with checkout");
                router.push(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/onboarding/checkout?plan=${planKey}`)}`);
                return;
            }
            
            try {
                const res = await fetch("/api/auth/refresh", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: session.user.id }),
                });
                
                if (!res.ok) {
                    throw new Error("Failed to verify user status");
                }
                
                const userData = await res.json();
                setUserEmail(userData.email);
                
                if (!userData.emailVerified) {
                    setEmailVerified(false);
                    toast.error("Please verify your email before proceeding with checkout");
                    router.push(`/${locale}/verify-email?email=${encodeURIComponent(userData.email)}`);
                    return;
                }
                
                setEmailVerified(true);
            } catch (error) {
                console.error("Error checking user status:", error);
                toast.error("Failed to verify user status. Please try again.");
                router.push(`/${locale}/login`);
            } finally {
                setAuthChecking(false);
            }
        };
        
        checkAuthAndVerification();
    }, [sessionStatus, session, router, locale, planKey]);

    return {
        authChecking,
        emailVerified,
        userEmail,
        sessionStatus
    };
}
