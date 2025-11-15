import React from 'react';
import { useStore } from '@/components/store/hooks/useStore'; 
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import GeometricDecorations from '../../shared/GeometricDecorations';
import { getStoreTranslation } from '../../../utils/translations';

const SocialIcon: React.FC<{ platform: 'facebook' | 'instagram' | 'tiktok'; href: string; color: string }> = ({
    platform,
    href,
    color,
}) => {
    const Icon = {
        facebook: FaFacebook,
        instagram: FaInstagram,
        tiktok: FaTiktok,
    }[platform];

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-125 border-2 border-white/30 bg-white/10 hover:bg-white/20"
            style={{ 
                color: '#ffffff'
            }}
        >
            <span className="sr-only">{platform}</span>
            <Icon className="h-6 w-6" />
        </a>
    );
};

const Footer: React.FC = () => {
    const { selectedStore } = useStore();
    if (!selectedStore) return null;

    const brandName = selectedStore.brandName || 'My Store';
    // Clean footer text - remove duplicate copyright/year if present
    let footerText = selectedStore.footer?.text || 'All rights reserved.';
    const copyrightPattern = /^©\s*\d{4}[\s\S]*?[.,]\s*/i;
    footerText = footerText.replace(copyrightPattern, '').trim();
    if (!footerText) footerText = 'All rights reserved.';

    const socialLinks = selectedStore.socialLinks || {};
    const primaryColor = selectedStore.theme?.primaryColor || '#a78bfa';
    const storeLanguage = selectedStore.language || 'en';
    
    // Header links (same as in Header component) with translations
    const headerLinks = [
        { label: getStoreTranslation("about", storeLanguage), href: "#about" },
        { label: getStoreTranslation("products", storeLanguage), href: "#products" },
        { label: getStoreTranslation("contact", storeLanguage), href: "#contact" },
    ];

    return (
        <footer 
            className="relative text-white py-12 sm:py-16 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${selectedStore.theme?.secondaryColor || primaryColor})` }}
        >
            {/* Floral Geometric Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <GeometricDecorations type="floral" color="#ffffff" />
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Logo and Links Section */}
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
                    {/* Logo with Beauty Badge */}
                    <div className="flex flex-col items-center md:items-start">
                        {selectedStore.logoUrl ? (
                            <div className="relative">
                                <img
                                    src={selectedStore.logoUrl}
                                    alt={`${brandName} logo`}
                                    className="h-12 w-auto object-contain mb-4 rounded-full"
                                />
                            </div>
                        ) : (
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">{brandName}</h3>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col sm:flex-row items-center md:items-start gap-4 sm:gap-6">
                        {headerLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-white/90 hover:text-white transition-colors duration-200 text-sm font-bold"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Social Links */}
                    <div className="flex space-x-4">
                        {socialLinks.facebook && (
                            <SocialIcon platform="facebook" href={socialLinks.facebook} color={primaryColor} />
                        )}
                        {socialLinks.instagram && (
                            <SocialIcon platform="instagram" href={socialLinks.instagram} color={primaryColor} />
                        )}
                        {socialLinks.tiktok && (
                            <SocialIcon platform="tiktok" href={socialLinks.tiktok} color={primaryColor} />
                        )}
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/20 pt-6 mt-6">
                    <p className="text-center text-sm text-white/90 font-medium">
                        &copy; {new Date().getFullYear()} {brandName}. {getStoreTranslation("allRightsReserved", storeLanguage)}
                    </p>
                    <p className="text-center text-xs text-white/80 mt-2 font-medium">
                        <a href="https://yurafy.com" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                            Powered by Yurafy
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

