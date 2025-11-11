import React from 'react';
import { Store } from 'lucide-react';

interface StorePreviewHeaderProps {
    title: string;
    subtitle: string;
}

const StorePreviewHeader: React.FC<StorePreviewHeaderProps> = ({ title, subtitle }) => {
    return (
        <header className="mb-5 flex flex-col items-start gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
                <Store className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">{title}</h3>
                <p className="text-xs text-gray-600 sm:text-sm">{subtitle}</p>
            </div>
        </header>
    );
};

export default StorePreviewHeader;
