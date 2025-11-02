import { FaUser } from "react-icons/fa";

interface ProfileHeaderProps {
    name: string;
    email: string;
    logo: string;
}

export default function ProfileHeader({ name, email, logo }: ProfileHeaderProps) {
    return (
        <div className="flex items-center gap-3 sm:gap-4">
            {logo ? (
                <img 
                    src={logo} 
                    alt="Logo" 
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-800 shadow-md flex-shrink-0" 
                />
            ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <FaUser className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">{name}</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">{email}</p>
            </div>
        </div>
    );
}
