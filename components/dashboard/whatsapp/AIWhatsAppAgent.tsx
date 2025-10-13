
"use client";

import { useTranslations } from "next-intl";

export default function AIWhatsAppAgent() {
    const t = useTranslations("WhatsAppPage");

    return (
        <div className="bg-gray-700 p-6 rounded-lg shadow-md text-white">
        <h2 className="text-2xl font-semibold mb-4">{t("aiAgent")}</h2>
        <label className="flex items-center justify-between">
            <span>{t("enableAIResponse")}</span>
            <input type="checkbox" className="w-5 h-5" />
        </label>
        </div>
    );
}
