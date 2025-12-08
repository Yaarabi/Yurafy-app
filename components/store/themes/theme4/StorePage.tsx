import React from 'react';
import Hero from './sections/Hero';
import ProductGrid from './sections/ProductGrid';
import Footer from './sections/Footer';
import About from './sections/About';
import Trust from './sections/Trust';
import SpecialOffer from './sections/SpecialOffer';
import Categories from './sections/Categories';
import { useStore } from '../../hooks/useStore';

const StorePage: React.FC = () => {
    const { selectedStore } = useStore() as { selectedStore: any };

    if (!selectedStore) return null;

    const themeStructure = (selectedStore as any).themeStructure ?? {
        header: true,
        hero: Boolean(selectedStore.hero),
        trust: true,
        productGrid: true,
        about: Boolean((selectedStore as any).about || (selectedStore as any).whoWeAre),
        footer: true,
    };

    const surfaceGradient = selectedStore.theme?.surfaceColor || '#f1f5f9';

    // Minimalist Theme Layout: Hero (includes Header) -> Product Grid -> About -> Trust -> Footer
    return (
        <main>
            {themeStructure.hero && <Hero />}
            <div style={{ background: surfaceGradient }}>
                <SpecialOffer />
                <Categories />
                {themeStructure.productGrid && <ProductGrid />}
                {themeStructure.about && <About />}
                {themeStructure.trust && <Trust />}
            </div>
            {themeStructure.footer && <Footer />}
        </main>
    );
};

export default StorePage;