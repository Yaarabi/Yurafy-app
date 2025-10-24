import { FaUser } from "react-icons/fa";

interface ProfileHeaderProps {
    name: string;
    email: string;
    logo: string;
}

export default function ProfileHeader({ name, email, logo }: ProfileHeaderProps) {
    return (
        <div className="flex items-center gap-4 mt-4">
        { (logo) ? <img src={logo} alt="Logo" className="w-16 h-16 rounded-full object-cover" /> : <FaUser size={30}/>}
        <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{email}</p>
        </div>
        </div>
    );
}
