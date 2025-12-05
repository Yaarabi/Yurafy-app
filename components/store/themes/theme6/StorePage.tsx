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
        about: Boolean(selectedStore.whoWeAre),
        footer: true,
    };
    
    // Modern Card Theme Layout: Hero -> About -> Product Grid (Card Style) -> Trust -> Footer
    const primaryColor = selectedStore.theme?.primaryColor || '#3B82F6';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const textColor = selectedStore.theme?.textColor || '#ffffff';

    return (
        <main className="min-h-screen" style={{ 
            backgroundColor: '#f9fafb',
            '--color-primary': primaryColor,
            '--color-secondary': secondaryColor,
            '--color-text': textColor,
        } as React.CSSProperties}>
            {themeStructure.header && <Header />}
            {themeStructure.hero && (
                <div style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                    <Hero />
                </div>
            )}
            <SpecialOffer />
            <Categories />
            {themeStructure.productGrid && (
                <div className="py-16" style={{ backgroundColor: '#ffffff' }}>
                    <ProductGrid />
                </div>
            )}
            {themeStructure.about && <About />}
            {themeStructure.trust && <Trust />}
            {themeStructure.footer && <Footer />}
        </main>
    );
};

export default StorePage;

