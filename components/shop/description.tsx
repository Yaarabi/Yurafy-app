'use client';

export default function Description() {
    return (
        <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16"
        style={{ fontFamily: 'var(--font-family, Inter)' }}
        >
        <div className="text-center mb-12">
            <h1
            className="text-4xl sm:text-5xl drop-shadow-md"
            style={{
                fontWeight: 'var(--heading-weight, 700)',
                backgroundImage: `linear-gradient(to right, var(--gradient-from, var(--primary-color)), var(--gradient-via, var(--secondary-color)), var(--gradient-to, var(--button-color)))`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
            }}
            >
            Explore Our Collection
            </h1>
            <p className="mt-4 text-[var(--text-color)] text-lg sm:text-xl max-w-3xl mx-auto">
            Discover elegant, AI-powered, and handcrafted products from Yura’s marketplace.
            All orders support cash on delivery.
            </p>
        </div>
        </section>
    );
}
