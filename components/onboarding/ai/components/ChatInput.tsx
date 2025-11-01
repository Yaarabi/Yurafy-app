import { Send } from 'lucide-react';
import type { ConfirmationData } from '../hooks/useAIStoreSetup';

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    onSend: () => void;
    loading: boolean;
    confirmationData: ConfirmationData | null;
}

export default function ChatInput({ input, setInput, onSend, loading, confirmationData }: ChatInputProps) {
    const isDisabled = loading || (confirmationData !== null && confirmationData.requiresConfirmation);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="flex gap-3">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={confirmationData?.requiresConfirmation ? "Please use the confirmation buttons above..." : "Tell me about your business..."}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isDisabled}
            />
            <button
                onClick={onSend}
                disabled={isDisabled || !input.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
                <Send className="w-5 h-5" />
                Send
            </button>
        </div>
    );
}

