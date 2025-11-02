import React from 'react';
import Header from './sections/Header';
import Hero from './sections/Hero';
import ProductGrid from './sections/ProductGrid';
import Footer from './sections/Footer';
import About from './sections/About';
import Trust from './sections/Trust';
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
    
    // Retro Theme Layout: Hero -> About -> Product Grid -> Footer
    return (
        <main>
            {themeStructure.header && <Header />}
            {themeStructure.hero && <Hero />}
            {themeStructure.about && <About />}
            {themeStructure.productGrid && <ProductGrid />}
            {themeStructure.trust && <Trust />}
            {themeStructure.footer && <Footer />}
        </main>
    );
};

export default StorePage;