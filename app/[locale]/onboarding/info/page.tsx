"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import AIStoreSetup from "@/components/onboarding/ai/AIStoreSetup";

export default function InfoPage() {
    const searchParams = useSearchParams();
    const plan = useMemo(() => searchParams.get("plan"), [searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 flex justify-center items-start">
            <div className="w-full max-w-6xl">
                <AIStoreSetup
                    plan={plan || "Starter"}
                    onComplete={(data) => {
                        // Store creation and redirect handled inside AIStoreSetup component
                        console.log("Store setup completed:", data);
                    }}
                />
            </div>
        </div>
    );
}
