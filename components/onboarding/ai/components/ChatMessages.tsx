import { AnimatePresence } from 'framer-motion';
import type { Message, ConfirmationData } from '../hooks/useAIStoreSetup';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import { CheckCircle2 } from 'lucide-react';

interface ChatMessagesProps {
    messages: Message[];
    loading: boolean;
    confirmationData?: ConfirmationData | null;
    onConfirm?: () => void;
    onReject?: () => void;
}

export default function ChatMessages({ messages, loading, confirmationData, onConfirm, onReject }: ChatMessagesProps) {
    // Filter out the last assistant message if it's a confirmation request (to avoid duplicate)
    const filteredMessages = confirmationData && confirmationData.requiresConfirmation
        ? messages.filter((msg, index) => {
            // Remove the last assistant message if it matches the confirmation message
            if (index === messages.length - 1 && msg.role === 'assistant' && msg.content === confirmationData.message) {
                return false;
            }
            return true;
        })
        : messages;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 h-96 overflow-y-auto space-y-4">
            <AnimatePresence>
                {filteredMessages.map((message, index) => (
                    <MessageBubble key={index} message={message} index={index} />
                ))}
            </AnimatePresence>

            {/* Show confirmation buttons - but only if preview_edit is NOT showing */}
            {confirmationData && confirmationData.requiresConfirmation && (
                <div className="mt-4 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg">
                    <p className="text-sm text-gray-700 mb-3 font-medium">
                        Please confirm to proceed with creating your store.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {onConfirm && (
                            <button
                                onClick={onConfirm}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] text-base"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Confirm & Create Store</span>
                            </button>
                        )}
                        {onReject && (
                            <button
                                onClick={onReject}
                                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3.5 px-6 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow-md text-base"
                            >
                                Make Changes
                            </button>
                        )}
                    </div>
                </div>
            )}

            {loading && <LoadingIndicator />}
        </div>
    );
}

