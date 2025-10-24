"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import WhatsAppIntegrationPage from "@/components/dashboard/whatsapp/tabs/TabsPages";
import { useTranslations } from "next-intl";



export default function WhatsAppSettingsPage() {
    const t = useTranslations("WhatsAppPage");

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center p-4 space-y-6">
        <div className="w-full space-y-6 mt-10">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4">
                <WhatsAppIntegrationPage />
            </div>
        </div>
        </div>
    );
}


