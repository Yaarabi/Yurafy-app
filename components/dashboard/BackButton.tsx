
'use client';

import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

export default function BackButton() {
    const router = useRouter();

    return (
        <button
        type="button"
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-md transition"
        >
        <FaArrowLeft/> 
        </button>
    );
}
