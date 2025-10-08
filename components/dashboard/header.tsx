'use client';

import LocaleSwitcher from '../home/LocaleSwitcher';
import { useSession } from 'next-auth/react';

export default function Header() {
    const { data: session } = useSession();

    return (
        <header className="sticky top-0 z-20 h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-900/90 backdrop-blur-sm shadow-md">
        <h1 className="text-lg font-semibold text-white">{session?.user?.name}</h1>
        <div className="flex items-center gap-2">
            <LocaleSwitcher />
        </div>
        </header>
    );
}
