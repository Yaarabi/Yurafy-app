interface PlanInfoProps {
    description: string;
    price: number;
    duration?: string;
}

export default function PlanInfo({ description, price, duration = 'month' }: PlanInfoProps) {
    return (
        <div className="text-center mb-4 sm:mb-6 space-y-2 sm:space-y-3">
            <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed px-2 sm:px-4">
                {description}
            </p>
            <div className="pt-2">
                <p className="text-indigo-600 font-semibold text-2xl sm:text-3xl md:text-4xl">
                    ${price}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                    per {duration}
                </p>
            </div>
        </div>
    );
}
