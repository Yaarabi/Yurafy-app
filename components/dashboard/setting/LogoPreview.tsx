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
            className="w-16 h-16 rounded-full object-cover border border-gray-500"
            />
        ) : (
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-700">
            <FaUser size={28} className="text-gray-300" />
            </div>
        )}

        <label className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm cursor-pointer hover:bg-indigo-700 transition">
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
