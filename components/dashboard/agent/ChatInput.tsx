'use client';

interface Props {
    input: string;
    setInput: (val: string) => void;
    loading: boolean;
    onSend: () => void;
}

export default function ChatInput({ input, setInput, loading, onSend }: Props) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") onSend();
    };

    return (
        <div className="flex gap-2 mt-3 sm:mt-4">
        <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] text-sm sm:text-base"
        />
        <button
            onClick={onSend}
            disabled={loading || !input.trim()}
            className="px-4 sm:px-6 py-3 bg-[var(--brand-blue)] rounded-lg hover:bg-[var(--brand-blue)]/90 transition disabled:opacity-50 text-sm sm:text-base text-white"
        >
            {loading ? "..." : "Send"}
        </button>
        </div>
    );
}
