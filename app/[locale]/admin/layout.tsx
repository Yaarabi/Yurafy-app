"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const locale = (params?.locale as string) || 'en';
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push(`/${locale}/login`);
            return;
        }

        if (status === "authenticated") {
            if (session?.user?.role !== "admin") {
                router.push(`/${locale}/dashboard`);
                return;
            }
            setChecking(false);
        }
    }, [status, session, router, locale]);

    // Show loading state while checking
    if (status === "loading" || checking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking admin access...</p>
                </div>
            </div>
        );
    }

    // If not admin, this will redirect, but show loading while redirecting
    if (session?.user?.role !== "admin") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <AdminHeader />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full"
            >
                {children}
            </motion.div>
        </div>
    );
}
