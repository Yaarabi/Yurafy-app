'use client';
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getSession } from "next-auth/react";

interface WhatsAppData {
    whatsappAccount: any | null;
    aiAgent: any | null;
    templates: any[];
    plan: {
        planKey: string;
        hasAIAgentAccess: boolean;
        currentPlan: any | null;
    };
}

export function useWhatsAppData() {
    const [data, setData] = useState<WhatsAppData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const session = await getSession();
                
                if (!session?.user?.id) {
                    throw new Error("User not authenticated");
                }

                const res = await fetch("/api/user/whatsapp-data");
                
                if (!res.ok) {
                    throw new Error("Failed to fetch WhatsApp data");
                }

                const result = await res.json();
                
                if (result.success) {
                    setData(result.data);
                } else {
                    throw new Error(result.error || "Failed to fetch data");
                }
            } catch (err) {
                console.error("Error fetching WhatsApp data:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch data");
                toast.error("Failed to load WhatsApp data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const updateAgent = async (payload: Record<string, unknown>) => {
        if (!data?.aiAgent) return;

        try {
            const session = await getSession();
            const userId = session?.user?.id;
            
            if (!userId) {
                toast.error("User not authenticated");
                return;
            }

            const res = await fetch(`/api/ai-agent`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    owner: userId,
                    ...payload 
                }),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Update failed");
            }
            
            const result = await res.json();
            
            setData(prev => prev ? {
                ...prev,
                aiAgent: result.agent
            } : null);
            
            toast.success("Agent updated");
        } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : "Update failed");
        }
    };

    return {
        data,
        loading,
        error,
        updateAgent
    };
}
