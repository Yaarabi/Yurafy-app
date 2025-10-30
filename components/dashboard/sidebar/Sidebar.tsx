"use client";

import { useEffect, useState } from "react";
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
    const [userDetails, setUserDetails] = useState<any>(null);

    const { data: session, status } = useSession();
    const userId = session?.user?.id;

    useEffect(() => {
        if (status === "authenticated" && userId) {
        fetch("/api/auth/refresh", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: userId }),
        })
            .then(async (res) => {
            if (!res.ok) throw new Error("Failed to fetch user details");
            const data = await res.json();
            setUserDetails(data);
            })
            .catch(() => {
            signOut({ redirect: false }).then(() => {
                router.push(`/${params.locale}/login`);
            });
            });
        }
    }, [status, userId, router, params.locale]);

    if (!userDetails) return null;

    const handleSignOut = () => {
        signOut({ redirect: false }).then(() => {
        router.push(`/${params.locale}/login`);
        });
    };

    return (
        <>
        {/* Mobile toggle */}
        <button
            className="fixed top-4 left-4 z-50 p-2 rounded-md bg-[var(--brand-blue)] text-white md:hidden shadow-md"
            onClick={() => setOpen(!open)}
        >
            {open ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>

        {/* Sidebar */}
        <aside
            className={`fixed top-0 left-0 z-40 h-full max-h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-6
            transition-transform duration-300 transform 
            ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:shadow-none`}
        >
            <SidebarProfile user={userDetails} />
            <SidebarNav userPlan={userDetails.plan || "free"} pathname={pathname} t={t} />
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
