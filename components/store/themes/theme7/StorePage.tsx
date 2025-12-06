import React from 'react';
import Header from './sections/Header';
import Hero from './sections/Hero';
import ProductGrid from './sections/ProductGrid';
import Trust from './sections/Trust';
import Footer from './sections/Footer';
import About from './sections/About';
import SpecialOffer from '../shared/SpecialOffer';
import Categories from '../shared/Categories';
import { useStore } from '../../hooks/useStore';

const StorePage: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const themeStructure = (selectedStore as any).themeStructure ?? {
        header: true,
        hero: Boolean(selectedStore.hero),
        trust: true,
        productGrid: true,
        about: Boolean((selectedStore as any).about || (selectedStore as any).whoWeAre),
        footer: true,
    };
    
    // Masonry Grid Theme Layout: Full-width Hero -> Product Grid (Masonry) -> About -> Trust -> Footer
    const primaryColor = selectedStore.theme?.primaryColor || '#8B5CF6';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const textColor = selectedStore.theme?.textColor || '#ffffff';

    return (
        <main className="min-h-screen" style={{ 
            backgroundColor: '#ffffff',
            '--color-primary': primaryColor,
            '--color-secondary': secondaryColor,
            '--color-text': textColor,
        } as React.CSSProperties}>
            {themeStructure.header && <Header />}
            {themeStructure.hero && (
                <div className="relative w-full overflow-hidden" style={{ 
                    background: `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    minHeight: '70vh',
                }}>
                    <Hero />
                </div>
            )}
            <SpecialOffer />
            <Categories />
            {themeStructure.productGrid && (
                <div className="py-16 px-4 sm:px-6 lg:px-8">
                    <ProductGrid />
                </div>
            )}
            {themeStructure.about && (
                <div className="py-16" style={{ backgroundColor: '#f9fafb' }}>
                    <About />
                </div>
            )}
            {themeStructure.trust && <Trust />}
            {themeStructure.footer && <Footer />}
        </main>
    );
};

export default StorePage;

