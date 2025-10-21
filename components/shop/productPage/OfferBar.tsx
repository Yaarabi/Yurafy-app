'use client';

export default function OfferBar() {
    return (
        <div
            className="w-full text-white text-center py-2 text-sm font-semibold animate-pulse"
            style={{
                backgroundImage: 'linear-gradient(to right, var(--primary-color), var(--button-color))',
            }}
        >
            Offre spéciale ! Livraison gratuite aujourd’hui 🚚
        </div>
    );
}
