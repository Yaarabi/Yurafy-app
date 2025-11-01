import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ConfirmationData } from '../hooks/useAIStoreSetup';

interface ConfirmationUIProps {
    confirmationData: ConfirmationData | null;
    onConfirm: () => void;
    onReject: () => void;
}

export default function ConfirmationUI({ confirmationData, onConfirm, onReject }: ConfirmationUIProps) {
    if (!confirmationData || !confirmationData.requiresConfirmation) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-lg p-4 border-2 border-amber-200"
            >
                <div className="flex gap-3">
                    <button
                        onClick={onConfirm}
                        className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        Yes, Create Store
                    </button>
                    <button
                        onClick={onReject}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                        Make Changes
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

