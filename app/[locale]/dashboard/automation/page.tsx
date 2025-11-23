"use client";

import { useState, useCallback } from "react";
import WhatsAppIntegrationPage from "@/components/dashboard/whatsapp/tabs/TabsPages";
import { useTranslations } from "next-intl";

export default function WhatsAppSettingsPage() {
    const t = useTranslations("whatsappPage");
    const [isLoading, setIsLoading] = useState(true);

    const handleLoadingChange = useCallback((loading: boolean) => {
        setIsLoading(loading);
    }, []);

    return (
        <>
            <WhatsAppIntegrationPage onLoadingChange={handleLoadingChange} />
        </>
    );
}


