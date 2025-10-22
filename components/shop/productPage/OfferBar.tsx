'use client';

export default function OfferBar() {
    return (
        <div
        className="w-full text-white text-center py-2 text-sm font-semibold animate-pulse"
        style={{
            backgroundImage: `linear-gradient(to right, var(--gradient-from, var(--primary-color)), var(--gradient-via, var(--primary-color)), var(--gradient-to, var(--button-color)))`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontFamily: 'var(--font-family, Inter)',
        }}
        >
        Offre spéciale ! Livraison gratuite aujourd’hui 🚚
        </div>
    );
}
