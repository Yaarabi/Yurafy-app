"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Logo from "./logo";
import { useParams, useRouter } from "next/navigation";



const nav= [
    { href: "dashboard", icon: "🏠", key: "nav.dashboard" },
    { href: "dashboard/orders", icon: "🧾", key: "nav.orders" },
    { href: "dashboard/products", icon: "🛍️", key: "nav.products" },
    { href: "dashboard/settings", icon: "⚙️", key: "nav.settings" },
    { href: "dashboard/support", icon: "🤖", key: "nav.support" },
];

export default function Sidebar() {
    const t = useTranslations();
    const pathname = usePathname();
    const params = useParams()
    const router = useRouter()

    return (
        <aside className="w-64 bg-gray-950/70 border-r border-gray-800 p-4 flex flex-col gap-6">
        <Logo size={32} />
        <nav className="flex flex-col gap-1">
            {nav.map(({ href, icon, key }) => {
                const active = pathname?.includes(href);
                const handle = () => {
                        router.push(`/${params.locale}/${href}`);
                };
            return (
                <div
                key={href}
                onClick={handle}
                className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md transition
                ${active ? "bg-indigo-600/20 text-white" : "text-gray-300 hover:bg-gray-800"}`}
                >
                <span>{icon}</span>
                <span>{t(key)}</span>
                </div>
            );
            })}
        </nav>
        <div className="mt-auto">
            <form action="/api/logout" method="post">
            <button
                type="submit"
                className="cursor-pointer w-full px-3 py-2 rounded-md bg-gray-800 hover:bg-red-700 text-gray-200"
            >
                {t("common.logout")}
            </button>
            </form>
        </div>
        </aside>
    );
}
