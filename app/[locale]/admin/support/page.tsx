"use client";

import AdminSupportChat from "@/components/admin/AdminSupportChat";

export default function AdminSupportPage() {
    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Support Management
                </h1>
                <AdminSupportChat />
            </div>
        </div>
    );
}

