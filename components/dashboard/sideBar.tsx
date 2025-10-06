'use client';

import { useState } from 'react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
    MdDashboard, 
    MdShoppingCart, 
    MdInventory2, 
    MdSettings, 
    MdSupportAgent, 
    MdClose, 
    MdMenu 
} from 'react-icons/md';

const navItems = [
    { href: 'dashboard', icon: <MdDashboard size={20} />, key: 'nav.dashboard' },
    { href: 'dashboard/orders', icon: <MdShoppingCart size={20} />, key: 'nav.orders' },
    { href: 'dashboard/products', icon: <MdInventory2 size={20} />, key: 'nav.products' },
    { href: 'dashboard/settings', icon: <MdSettings size={20} />, key: 'nav.settings' },
    { href: 'dashboard/support', icon: <MdSupportAgent size={20} />, key: 'nav.support' },
];

export default function Sidebar() {
    const t = useTranslations();
    const pathname = usePathname();
    const params = useParams();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    return (
        <>
        {/* Mobile toggle button */}
        <button
            className="fixed top-4 left-4 z-50 p-2 rounded-md bg-indigo-600 text-white md:hidden"
            onClick={() => setOpen(!open)}
        >
            {open ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>

        {/* Sidebar */}
        <aside
            className={`
            fixed md:relative top-0 left-0 z-40 h-full w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col gap-6
            transition-transform transform ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            `}
        >
            {/* Logo */}
            <div className="text-2xl font-bold text-indigo-500">Rua Dashboard</div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 mt-6">
            {navItems.map(({ href, icon, key }) => {
                const active = pathname?.includes(href);
                return (
                <div
                    key={href}
                    onClick={() => router.push(`/${params.locale}/${href}`)}
                    className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md transition
                    ${active ? 'bg-indigo-600/20 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
                    `}
                >
                    {icon}
                    <span className="font-medium">{t(key)}</span>
                </div>
                );
            })}
            </nav>

            {/* Logout */}
            <div className="mt-auto">
            <form action="/api/logout" method="post">
                <button
                type="submit"
                className="cursor-pointer w-full px-3 py-2 rounded-md bg-gray-800 hover:bg-red-600 text-gray-200 font-medium transition"
                >
                {t('common.logout')}
                </button>
            </form>
            </div>
        </aside>

        {/* Overlay for mobile */}
        {open && (
            <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setOpen(false)}
            />
        )}
        </>
    );
}
