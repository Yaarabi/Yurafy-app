import { FaUser } from "react-icons/fa";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SidebarProfile({ user }: { user: any }) {
    const [brandName, setBrandName] = useState("");
    const [logo, setLogo] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Use /api/user/features which is accessible to all authenticated users
                const res = await fetch('/api/user/features');
                if (res.ok) {
                    const data = await res.json();
                    // Get logo from user or store
                    const userLogo = data.user?.logo || data.features?.store?.logoUrl || '';
                    // Get brandName from store or fallback to username
                    const storeBrandName = data.features?.store?.brandName || data.user?.username || '';
                    
                    setLogo(userLogo);
                    setBrandName(storeBrandName);
                }
            } catch (err) {
                console.error("Failed to fetch user data:", err);
                // Fallback to session user data if API fails
                if (user?.logo) setLogo(user.logo);
                if (user?.username) setBrandName(user.username);
            }
        };
        
        fetchUserData();
    }, [user]);

    return (
        <div className="flex items-center gap-3">
            {logo ? (
                <Image
                    src={logo}
                    alt="User Logo"
                    width={40}
                    height={40}
                    className="rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-800"
                />
            ) : (
                <div className="w-10 h-10 flex items-center justify-center rounded-full 
                                bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    <FaUser size={20} />
                </div>
            )}

            <div className="overflow-hidden min-w-0 flex-1">
                <p
                    className="font-semibold truncate text-gray-800 dark:text-gray-100 hover:text-[var(--brand-blue)] transition-colors"
                >
                    {brandName || user?.username || 'User'}
                </p>
                <p className="text-xs truncate text-gray-500 dark:text-gray-400">
                    {user?.email || ''}
                </p>
            </div>
        </div>
    );
}
