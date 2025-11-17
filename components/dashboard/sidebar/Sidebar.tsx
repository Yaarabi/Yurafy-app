"use client";

import { useEffect, useState } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
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
        {/* Mobile toggle - Modern hamburger menu on the right */}
        <button
            className="fixed top-4 right-4 z-50 p-2 md:hidden transition-all duration-200"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
        >
            {open ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-200" strokeWidth={2.5} />
            ) : (
                <div className="flex flex-col gap-1.5">
                    <span className="w-6 h-0.5 bg-gray-700 dark:bg-gray-200 rounded-full transition-all"></span>
                    <span className="w-6 h-0.5 bg-gray-700 dark:bg-gray-200 rounded-full transition-all"></span>
                    <span className="w-6 h-0.5 bg-gray-700 dark:bg-gray-200 rounded-full transition-all"></span>
                </div>
            )}
        </button>

        {/* Sidebar */}
        <aside
            className={`fixed top-0 left-0 z-40 h-full max-h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-6
            transition-transform duration-300 transform 
            ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:shadow-none`}
        >
            <SidebarProfile user={userDetails} />
            <SidebarNav userPlan={userDetails.plan || "free"} pathname={pathname} t={t} onNavClick={() => setOpen(false)} />
            <SidebarLogout handleSignOut={handleSignOut} t={t} />
        </aside>

        {/* Mobile overlay */}
        {open && (
            <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
            onClick={() => setOpen(false)}
            />
        )}
        </>
    );
}
