"use client";

import React from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";

interface IntegrationCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    link: string; 
    linkLabel: string;
}

export default function IntegrationCard({ icon, title, description, link, linkLabel }: IntegrationCardProps) {
    const router = useRouter();
    const params = useParams();

    const handleClick = (e?: React.MouseEvent) => {
        e?.preventDefault();
        const locale = (params as any)?.locale || "";
        const path = link.startsWith("/") ? `/${locale}${link}` : `/${locale}/${link}`;
        router.push(path);
    };

    return (
        <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-transform duration-300 p-6 hover:-translate-y-1"
        >
        {/* Inner elements no longer move */}
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-md bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]">
            {icon}
            </div>

            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">{title}</h3>
        </div>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {description}
        </p>

        <div className="mt-4">
            <button
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-[var(--brand-blue)] text-white shadow-sm hover:shadow-md transition"
            >
            {linkLabel}
            </button>
        </div>
        </motion.div>
    );
}
