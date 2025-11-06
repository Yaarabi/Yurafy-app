import React from 'react';
import Header from './sections/Header';
import Hero from './sections/Hero';
import ProductGrid from './sections/ProductGrid';
import Trust from './sections/Trust';
import Footer from './sections/Footer';
import About from './sections/About';
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
    
    // Minimalist Stack Theme Layout: Large Typography Hero -> About -> Product Grid -> Trust -> Footer
    const primaryColor = selectedStore.theme?.primaryColor || '#1F2937';
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
                <div className="relative min-h-[80vh] flex items-center justify-center" style={{ 
                    background: `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}>
                    <Hero />
                </div>
            )}
            {themeStructure.productGrid && (
                <div className="py-24" style={{ backgroundColor: '#f9fafb' }}>
                    <ProductGrid />
                </div>
            )}
            {themeStructure.about && (
                <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                    <About />
                </div>
            )}
            {themeStructure.trust && (
                <div className="py-16 border-t border-b border-gray-200">
                    <Trust />
                </div>
            )}
            {themeStructure.footer && <Footer />}
        </main>
    );
};

export default StorePage;

