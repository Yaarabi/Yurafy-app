import React from 'react';
import { useStore } from '@/components/store/hooks/useStore'; 
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';

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
            className="w-12 h-12 rounded-none flex items-center justify-center transition-all duration-300 hover:scale-125 border-4"
            style={{ 
                backgroundColor: color,
                borderColor: color,
                color: 'white' 
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
    const primaryColor = selectedStore.theme?.primaryColor || '#db2777';
    
    // Header links (same as in Header component)
    const headerLinks = [
        { label: "About", href: "#about" },
        { label: "Products", href: "#products" },
        { label: "Contact", href: "#contact" },
    ];

    return (
        <footer 
            className="text-white py-16 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${selectedStore.theme?.secondaryColor || primaryColor})` }}
        >
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 transform rotate-45 origin-top-left rounded-full"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Logo and Links Section */}
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center md:items-start">
                        {selectedStore.logoUrl ? (
                            <img
                                src={selectedStore.logoUrl}
                                alt={`${brandName} logo`}
                                className="h-12 w-auto object-contain mb-4"
                            />
                        ) : (
                            <h3 className="text-2xl font-black text-white uppercase tracking-wide mb-4">{brandName}</h3>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col sm:flex-row items-center md:items-start gap-4 sm:gap-6">
                        {headerLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-white/90 hover:text-white transition-colors duration-200 text-sm font-black uppercase tracking-wide"
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
                        {socialLinks.twitter && (
                            <SocialIcon platform="tiktok" href={socialLinks.tiktok} color={primaryColor} />
                        )}
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/20 pt-6 mt-6">
                    <p className="text-center text-sm text-white/90 font-bold uppercase tracking-wider">
                        &copy; {new Date().getFullYear()} {brandName}. {footerText}
                    </p>
                    <p className="text-center text-xs text-white/70 mt-2 font-bold uppercase tracking-wider">
                        Powered by Yurafy
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

