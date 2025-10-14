"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AIWhatsAppAgent from "@/components/dashboard/whatsapp/AIWhatsAppAgent";
import WhatsAppIntegrationPage from "@/components/dashboard/whatsapp/tabs/TabsPages";
import { useTranslations } from "next-intl";

type WhatsAppPlan = "automation" | "aiAgent" | "none";

export default function WhatsAppSettingsPage() {
    const t = useTranslations("WhatsAppPage");
    const { data: session } = useSession();
    const [whatsAppPlan, setWhatsAppPlan] = useState<WhatsAppPlan>("none");

    useEffect(() => {
        const userPlan = session?.user?.plan;

        switch (userPlan) {
        case "WhatsApp Automation":
        case "Pro Seller":
            setWhatsAppPlan("automation");
            break;
        case "AI WhatsApp Agent":
        case "Visionary":
            setWhatsAppPlan("aiAgent");
            break;
        default:
            setWhatsAppPlan("none");
        }
    }, [session]);

    if (whatsAppPlan === "none") {
        return (
        <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
            <p>{t("noAccess")}</p>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-800 flex flex-col items-center p-4 space-y-6">
        <div className="w-full max-w-4xl space-y-6">
            

            {whatsAppPlan === "automation" && <WhatsAppIntegrationPage/>
            // <WhatsAppBotPanel />
            }
            {whatsAppPlan === "aiAgent" && <AIWhatsAppAgent />}
        </div>
        </div>
    );
}
