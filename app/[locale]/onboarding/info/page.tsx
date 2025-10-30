"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import StoreSection from "@/components/onboarding/info/storeInfo";
import WhatsAppSection from "@/components/onboarding/info/waAccountInfo";

export default function InfoPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const plan = useMemo(() => searchParams.get("plan"), [searchParams]);
    const locale = useMemo(() => searchParams.get("locale") ?? "en", [searchParams]);

    const [storeOpen, setStoreOpen] = useState(true);
    const [waOpen, setWaOpen] = useState(true);

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
            <StoreSection storeData={storeData} setStoreData={setStoreData} open={storeOpen} setOpen={setStoreOpen} />
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
