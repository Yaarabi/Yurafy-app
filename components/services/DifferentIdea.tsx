"use client"

import { useTranslations } from "next-intl"

type Props = {
    onRequest?: () => void
}

export default function DifferentIdea({ onRequest }: Props) {
    const t = useTranslations("services")

    return (
        <section
        className="max-w-7xl mx-auto px-4 py-16"
        aria-labelledby="different-idea-title"
        >
        <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-md flex flex-col md:flex-row items-center gap-8 transition-transform duration-200 hover:scale-[1.01]">
            
            {/* Badge */}
            <div className="absolute right-6 top-6">
            <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                {t("differentIdea.badge")}
            </span>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
            <h3
                id="different-idea-title"
                className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight"
            >
                {t("differentIdea.title")}
            </h3>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {t("differentIdea.description")}
            </p>
            </div>

            {/* CTA */}
            <div>
            <button
                onClick={onRequest}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white rounded-lg text-sm font-semibold shadow-md transition-colors duration-200"
            >
                {t("differentIdea.cta")}
            </button>
            </div>
        </div>
        </section>
    )
}
