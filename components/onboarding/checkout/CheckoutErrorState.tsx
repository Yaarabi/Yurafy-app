interface CheckoutErrorStateProps {
    error: string;
    onBackToPlan: () => void;
}

export default function CheckoutErrorState({ error, onBackToPlan }: CheckoutErrorStateProps) {
    return (
        <div className="min-h-screen flex items-center justify-center py-4 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-full max-w-md bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 text-center">
                <p className="text-base sm:text-lg md:text-xl text-red-600 font-medium mb-2">
                    {error}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                    Please select a valid plan from the plan selection page.
                </p>
                <button
                    onClick={onBackToPlan}
                    className="px-4 py-2 sm:px-6 sm:py-2.5 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-700 transition-colors"
                >
                    Choose a Plan
                </button>
            </div>
        </div>
    );
}
