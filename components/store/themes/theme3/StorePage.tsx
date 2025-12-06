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
    
    // Eco Theme Layout: Hero -> Product Grid -> About -> Trust -> Footer
    return (
        <main>
            {themeStructure.header && <Header />}
            {themeStructure.hero && <Hero />}
            <SpecialOffer />
            <Categories />
            {themeStructure.productGrid && <ProductGrid />}
            {themeStructure.about && <About />}
            {themeStructure.trust && <Trust />}
            {themeStructure.footer && <Footer />}
        </main>
    );
};

export default StorePage;