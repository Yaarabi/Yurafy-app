"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface PageHeaderProps {
    onBack?: () => void;
}

export default function PageHeader({ onBack }: PageHeaderProps) {
    const params = useParams();
    const router = useRouter();

    const handleBack = onBack || (() => {
        const locale = (params as any)?.locale || "en";
        router.push(`/${locale}/dashboard/settings`);
    });

    return (
        <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold hover:text-indigo-900 dark:hover:text-indigo-300 active:scale-95 transition-all w-fit"
        >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to settings</span>
        </button>
    );
}
