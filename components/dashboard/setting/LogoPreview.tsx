import { FaUser } from "react-icons/fa";
import Image from "next/image";
import { ChangeEvent } from "react";

interface LogoUploaderProps {
    logoUrl?: string;
    onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function LogoUploader({ logoUrl, onUpload }: LogoUploaderProps) {
    return (
        <div className="flex items-center gap-4">
        {logoUrl ? (
            <Image
            src={logoUrl}
            alt="Logo"
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-600"
            />
        ) : (
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <FaUser size={28} className="text-gray-500 dark:text-gray-300" />
            </div>
        )}

        <label className="px-3 py-1 rounded-md bg-brand-blue text-white text-sm cursor-pointer hover:opacity-90 transition">
            Change Logo
            <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUpload}
            />
        </label>
        </div>
    );
}
