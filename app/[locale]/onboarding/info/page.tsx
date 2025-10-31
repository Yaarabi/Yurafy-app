"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import StoreSection from "@/components/onboarding/info/storeInfo";
import WhatsAppSection from "@/components/onboarding/info/waAccountInfo";
import AIStoreSetup from "@/components/onboarding/ai/AIStoreSetup";

export default function InfoPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const plan = useMemo(() => searchParams.get("plan"), [searchParams]);
    const locale = useMemo(() => searchParams.get("locale") ?? "en", [searchParams]);

    const [storeOpen, setStoreOpen] = useState(true);
    const [waOpen, setWaOpen] = useState(true);
    const [useAI, setUseAI] = useState(true);

    const [storeData, setStoreData] = useState({
        brandName: "",
        domain: "",
        description: "",
        logoUrl: "",
        whoWeAreDesc: "",
        whoWeAreImage: "",
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
        heroTitle: "",
        heroSubtitle: "",
        heroImage: "",
    });

    const [waData, setWaData] = useState({
        waBusinessId: "",
        waNumberId: "",
        waNumber: "",
        waToken: "",
        aiPersonality: "friendly assistant",
    });

    const handleSubmit = async () => {
        await fetch("/api/onboarding/save-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            plan,
            store: {
            ...storeData,
            whoWeAre: { description: storeData.whoWeAreDesc, imageUrl: storeData.whoWeAreImage },
            socialLinks: {
                facebook: storeData.facebook,
                instagram: storeData.instagram,
                twitter: storeData.twitter,
                linkedin: storeData.linkedin,
            },
            hero: {
                title: storeData.heroTitle,
                subtitle: storeData.heroSubtitle,
                imageUrl: storeData.heroImage,
            },
            },
            whatsapp: {
            waBusinessId: waData.waBusinessId,
            waNumberId: waData.waNumberId,
            waNumber: waData.waNumber,
            waTokenEncrypted: waData.waToken,
            aiConfig: { personality: waData.aiPersonality },
            },
        }),
        });
        router.push(`/${locale}/onboarding/checkout?plan=${plan}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
        <div className="w-full max-w-4xl space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 text-center">
            Setup Info for <span className="capitalize">{plan}</span>
            </h1>

            {(plan === "starter" || plan === "proSeller" || plan === "visionary") && (
                <>
                    <div className="flex gap-4 mb-4">
                        <button
                            onClick={() => setUseAI(true)}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                                useAI
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            🤖 AI Assistant Setup
                        </button>
                        <button
                            onClick={() => setUseAI(false)}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                                !useAI
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            ✏️ Manual Setup
                        </button>
                    </div>
                    {useAI ? (
                        <AIStoreSetup
                            plan={plan || "Starter"}
                            onComplete={(suggestions) => {
                                setStoreData({
                                    ...storeData,
                                    brandName: suggestions.brandName || storeData.brandName,
                                    domain: suggestions.domain || storeData.domain,
                                    description: suggestions.description || storeData.description,
                                });
                                setUseAI(false);
                            }}
                        />
                    ) : (
                        <StoreSection storeData={storeData} setStoreData={setStoreData} open={storeOpen} setOpen={setStoreOpen} />
                    )}
                </>
            )}

            {(plan === "whatsapp" || plan === "aiAgent" || plan === "proSeller" || plan === "visionary") && (
            <WhatsAppSection waData={waData} setWaData={setWaData} open={waOpen} setOpen={setWaOpen} />
            )}

            <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 active:scale-95 transition"
            >
            Continue to Checkout
            </button>
        </div>
        </div>
    );
}
