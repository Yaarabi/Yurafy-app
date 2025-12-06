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
    const { selectedStore, disableNavigation } = useStore();

    if (!selectedStore) return null;

    const themeStructure = (selectedStore as any).themeStructure ?? {
        header: true,
        hero: Boolean(selectedStore.hero),
        trust: true,
        productGrid: true,
        about: Boolean((selectedStore as any).about || (selectedStore as any).whoWeAre),
        footer: true,
    };
    
    // Split Screen Theme Layout: Hero -> Product Grid (Split) -> About (Split) -> Trust -> Footer
    const primaryColor = selectedStore.theme?.primaryColor || '#EC4899';
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
                <div className="relative" style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}dd 0%, ${secondaryColor}dd 100%)`,
                    backgroundImage: `linear-gradient(135deg, ${primaryColor}dd, ${secondaryColor}dd), url('${selectedStore.hero?.imageUrl || ''}')`,
                    backgroundBlendMode: 'overlay',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}>
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <Hero />
                </div>
            )}
            <SpecialOffer />
            <Categories />
            {themeStructure.productGrid && (
                <div className="py-16 lg:py-24" style={{ backgroundColor: '#fafafa' }}>
                    <ProductGrid />
                </div>
            )}
            {themeStructure.about && (
                <div className="py-16 lg:py-24 bg-white">
                    <About />
                </div>
            )}
            {themeStructure.trust && (
                <div style={{ background: `linear-gradient(to right, ${primaryColor}15, ${secondaryColor}15)` }}>
                    <Trust />
                </div>
            )}
            {themeStructure.footer && <Footer />}
        </main>
    );
};

export default StorePage;

