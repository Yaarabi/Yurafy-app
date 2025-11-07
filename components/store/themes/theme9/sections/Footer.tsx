import React from 'react';
import { useStore } from '@/components/store/hooks/useStore'; 
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import { Heart } from 'lucide-react';
import GeometricDecorations from '../../shared/GeometricDecorations';

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
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border"
            style={{ 
                borderColor: color,
                color: color 
            }}
        >
            <span className="sr-only">{platform}</span>
            <Icon className="h-5 w-5" />
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
    const primaryColor = selectedStore.theme?.primaryColor || '#14b8a6';
    
    // Header links (same as in Header component)
    const headerLinks = [
        { label: "About", href: "#about" },
        { label: "Products", href: "#products" },
        { label: "Contact", href: "#contact" },
    ];

    return (
        <footer className="relative text-white py-12 sm:py-16 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${selectedStore.theme?.secondaryColor || primaryColor})` }}
        >
            {/* Wellness Geometric Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <GeometricDecorations type="wellness" color="#ffffff" />
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Logo and Links Section */}
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
                    {/* Logo with Health & Wellness Badge */}
                    <div className="flex flex-col items-center md:items-start">
                        {selectedStore.logoUrl ? (
                            <div className="relative">
                                <img
                                    src={selectedStore.logoUrl}
                                    alt={`${brandName} logo`}
                                    className="h-12 w-auto object-contain mb-4"
                                />
                                <div className="absolute -top-1 -right-1">
                                    <Heart className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mb-4">
                                <Heart className="w-6 h-6 text-white" />
                                <h3 className="text-xl sm:text-2xl font-bold text-white">{brandName}</h3>
                            </div>
                        )}
                        <span className="text-xs text-white/80 uppercase tracking-wider">
                            Health & Wellness
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col sm:flex-row items-center md:items-start gap-4 sm:gap-6">
                        {headerLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-white/90 hover:text-white transition-colors duration-200 text-sm font-semibold"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Social Links */}
                    <div className="flex space-x-4">
                        {socialLinks.facebook && (
                            <SocialIcon platform="facebook" href={socialLinks.facebook} color="#ffffff" />
                        )}
                        {socialLinks.instagram && (
                            <SocialIcon platform="instagram" href={socialLinks.instagram} color="#ffffff" />
                        )}
                        {socialLinks.twitter && (
                            <SocialIcon platform="tiktok" href={socialLinks.tiktok} color="#ffffff" />
                        )}
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/20 pt-6 mt-6">
                    <p className="text-center text-sm text-white/90 font-semibold">
                        &copy; {new Date().getFullYear()} {brandName}. {footerText}
                    </p>
                    <p className="text-center text-xs text-white/70 mt-2 font-semibold">
                        Powered by Yurafy
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

