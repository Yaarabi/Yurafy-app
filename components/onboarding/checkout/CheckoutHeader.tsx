interface CheckoutHeaderProps {
    planName: string;
}

export default function CheckoutHeader({ planName }: CheckoutHeaderProps) {
    return (
        <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
                Checkout: <span className="text-indigo-600">{planName}</span>
            </h1>
        </div>
    );
}
