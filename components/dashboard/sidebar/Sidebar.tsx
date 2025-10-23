
"use client";

import { useState } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { MdClose, MdMenu } from "react-icons/md";
import SidebarProfile from "./SidebarProfile";
import SidebarNav from "./SidebarNav";
import SidebarLogout from "./SidebarLogout";

export default function Sidebar() {
    const t = useTranslations();
    const pathname = usePathname();
    const params = useParams();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const { data: session } = useSession();
    const user = session?.user;

    if (!user) return null;

    const handleSignOut = () => {
        signOut({ redirect: false }).then(() => {
        router.push(`/${params.locale}/login`);
        });
    };

    return (
        <>
        {/* Mobile toggle */}
        <button
            className="fixed top-4 left-4 z-50 p-2 rounded-md bg-indigo-600 text-white md:hidden shadow-md"
            onClick={() => setOpen(!open)}
        >
            {open ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>

        {/* Sidebar */}
        <aside
            className={`fixed top-0 left-0 z-40 h-full w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col gap-6
            transition-transform duration-300 transform 
            ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:shadow-none`}
        >
            <SidebarProfile user={user} />
            <SidebarNav userPlan={user.plan || "free"} pathname={pathname} t={t} />
            <SidebarLogout handleSignOut={handleSignOut} t={t} />
        </aside>

        {/* Mobile overlay */}
        {open && (
            <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setOpen(false)}
            />
        )}
        </>
    );
}
