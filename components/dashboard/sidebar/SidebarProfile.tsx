
import { FaUser } from "react-icons/fa";
import Image from "next/image";
import { capitalizeFirstLetter } from "@/components/shop/productPage/ProductHeader"; 
import { useEffect, useState } from "react";

export default function SidebarProfile({ user }: { user: any }) {

    const [brandName, setBrandName] = useState("");

        useEffect(() => {
            const fetchUser = async () => {
                try {
                const res = await fetch(`/api/users?id=${user.id}`);
                const data = await res.json();
                if (res.ok) setBrandName(data.user.brandName ? capitalizeFirstLetter(data.user.brandName) : capitalizeFirstLetter(user.name || "User"));
                } catch (err) {
                console.error('Failed to fetch user:', err);
                }
            }
            fetchUser();
        }, [user]);


    return (
        <div className="flex items-center gap-3">
        {user?.logo ? (
            <Image src={user.logo} alt="User Logo" width={40} height={40} className="rounded-full object-cover" />
        ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700">
            <FaUser className="text-gray-300" size={20} />
            </div>
        )}
        <div className="overflow-hidden">
            <p className="font-semibold text-white truncate">{brandName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
        </div>
    );
}
