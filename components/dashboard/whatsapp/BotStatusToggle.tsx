
"use client";

interface Props {
    enabled: boolean;
    onToggle: () => void;
}

export default function BotStatusToggle({ enabled, onToggle }: Props) {
    return (
        <div className="flex items-center justify-between mb-6">
        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Bot Status:</span>
        <button
            onClick={onToggle}
            className={`px-4 py-2 rounded-full font-semibold transition ${
            enabled ? "bg-green-600 text-white" : "bg-gray-300 text-gray-800"
            }`}
        >
            {enabled ? "Activated" : "Deactivated"}
        </button>
        </div>
    );
}
