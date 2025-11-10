interface CheckoutLoadingStateProps {
    message: string;
}

export default function CheckoutLoadingState({ message }: CheckoutLoadingStateProps) {
    return (
        <div className="min-h-screen flex items-center justify-center py-4 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-full max-w-md bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 text-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">{message}</p>
            </div>
        </div>
    );
}
