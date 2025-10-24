'use client';
interface Props {
    onClear: () => void;
}

export default function ChatHeader({ onClear }: Props) {
    return (
        <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 text-center flex-1">
            Chat with your AI Agent
        </h1>
        <button
            onClick={onClear}
            className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-[var(--brand-blue)] transition"
        >
            Clear
        </button>
        </div>
    );
}
