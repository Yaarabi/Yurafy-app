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
    
    // Food Theme Layout: Hero (includes Header) -> Product Grid -> About -> Trust -> Footer
    return (
        <main className="min-h-screen" style={{ 
            backgroundColor: '#ffffff',
        } as React.CSSProperties}>
            {themeStructure.hero && <Hero />}
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

