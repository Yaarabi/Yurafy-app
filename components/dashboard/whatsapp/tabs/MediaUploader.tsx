"use client";

import { FaFileUpload } from "react-icons/fa";

interface MediaButtonProps {
    files: File[];
    setFiles: (files: File[]) => void;
}

export default function MediaButton({ files, setFiles }: MediaButtonProps) {
    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setFiles([...files, ...Array.from(e.target.files)]);
    };

    const handleRemove = (index: number) =>
        setFiles(files.filter((_, i) => i !== index));

    return (
        <div className="relative">
        {/* Icon upload button */}
        <label
            className="flex items-center justify-center w-10 h-10 bg-purple-600 hover:bg-purple-500 rounded cursor-pointer text-white transition"
            title="Add Media"
        >
            <FaFileUpload />
            <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFiles}
            accept="image/*,audio/*,video/*,application/pdf"
            />
        </label>

        {/* Selected files dropdown */}
        {files.length > 0 && (
            <ul className="absolute mt-2 max-h-40 w-56 overflow-auto bg-gray-700 rounded shadow-md p-2 space-y-1 z-10">
            {files.map((file, i) => (
                <li
                key={i}
                className="flex justify-between items-center text-white text-sm"
                >
                <span className="truncate">{file.name}</span>
                <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="text-red-400 hover:text-red-300 ml-2 transition"
                    title="Remove"
                >
                    ✕
                </button>
                </li>
            ))}
            </ul>
        )}
        </div>
    );
}
