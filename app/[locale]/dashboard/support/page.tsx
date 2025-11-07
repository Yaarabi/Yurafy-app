'use client';

import SupportChat from '@/components/dashboard/SupportChat';

export default function SupportPage() {
    return (
        <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <div className="w-full flex-1 min-h-0">
                <SupportChat />
            </div>
        </div>
    );
}
