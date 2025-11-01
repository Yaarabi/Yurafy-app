import React from 'react';
import Header from '../../sections/Header';
import Hero from '../../sections/Hero';
import ProductGrid from '../../sections/ProductGrid';
import Trust from '../../sections/Trust';
import Footer from '../../sections/Footer';
import About from '../../sections/About';
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
    
    // Tech Theme Layout: Hero -> Trust -> Product Grid -> About -> Footer
    return (
        <main>
            {themeStructure.header && <Header />}
            {themeStructure.hero && <Hero />}
            {themeStructure.trust && <Trust />}
            {themeStructure.productGrid && <ProductGrid />}
            {themeStructure.about && <About />}
            {themeStructure.footer && <Footer />}
        </main>
    );
};

export default StorePage;