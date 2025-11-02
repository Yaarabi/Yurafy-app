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
    
    // Bold Magazine Theme Layout: Asymmetric Hero -> Product Grid (Asymmetric) -> About -> Trust -> Footer
    const primaryColor = selectedStore.theme?.primaryColor || '#F59E0B';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const textColor = selectedStore.theme?.textColor || '#ffffff';

    return (
        <main className="min-h-screen overflow-hidden" style={{ 
            backgroundColor: '#ffffff',
            '--color-primary': primaryColor,
            '--color-secondary': secondaryColor,
            '--color-text': textColor,
        } as React.CSSProperties}>
            {themeStructure.header && <Header />}
            {themeStructure.hero && (
                <div className="relative w-full overflow-hidden" style={{ 
                    background: `linear-gradient(45deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}>
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 transform rotate-12 origin-top-right"></div>
                    <Hero />
                </div>
            )}
            {themeStructure.productGrid && (
                <div className="py-20" style={{ backgroundColor: '#fafafa' }}>
                    <ProductGrid />
                </div>
            )}
            {themeStructure.about && (
                <div className="py-20 relative">
                    <div className="absolute top-0 left-0 w-full h-1/2" style={{ 
                        background: `linear-gradient(to bottom, ${primaryColor}10, transparent)` 
                    }}></div>
                    <About />
                </div>
            )}
            {themeStructure.trust && (
                <div className="py-20" style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}08, ${secondaryColor}08)` 
                }}>
                    <Trust />
                </div>
            )}
            {themeStructure.footer && <Footer />}
        </main>
    );
};

export default StorePage;

