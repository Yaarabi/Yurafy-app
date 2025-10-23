import { FaUser } from "react-icons/fa";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SidebarProfile({ user }: { user: any }) {
    const [brandName, setBrandName] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
        try {
            const res = await fetch(`/api/users?id=${user.id}`);
            const data = await res.json();
            if (res.ok) setBrandName(data.user.brandName);
        } catch (err) {
            console.error("Failed to fetch user:", err);
        }
        };
        fetchUser();
    }, [user]);

    return (
        <div className="flex items-center gap-3">
        {user?.logo ? (
            <Image
            src={user.logo}
            alt="User Logo"
            width={40}
            height={40}
            className="rounded-full object-cover"
            />
        ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded-full 
                            bg-gray-200 text-gray-600 
                            dark:bg-gray-700 dark:text-gray-300">
            <FaUser size={20} />
            </div>
        )}

        <div className="overflow-hidden">
            <p
            className="font-semibold truncate 
                        text-gray-800 dark:text-gray-100 
                        hover:text-[var(--brand-blue)] transition-colors"
            >
            {brandName}
            </p>
            <p className="text-xs truncate text-gray-500 dark:text-gray-400">
            {user?.email}
            </p>
        </div>
        </div>
    );
}
