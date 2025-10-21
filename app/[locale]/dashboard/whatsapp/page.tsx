"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import WhatsAppIntegrationPage from "@/components/dashboard/whatsapp/tabs/TabsPages";
import { useTranslations } from "next-intl";



export default function WhatsAppSettingsPage() {
    const t = useTranslations("WhatsAppPage");

    return (
        <div className="min-h-screen bg-gray-800 flex flex-col items-center p-4 space-y-6">
        <div className="w-full max-w-4xl space-y-6">
            
            <WhatsAppIntegrationPage/>
        </div>
        </div>
    );
}


