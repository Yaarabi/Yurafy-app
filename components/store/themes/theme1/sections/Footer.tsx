import React from 'react';
import { useStore } from '@/components/store/hooks/useStore'; 
import { FacebookIcon, InstagramIcon, TwitterIcon } from '@/components/store/components/icons';

const SocialIcon: React.FC<{ platform: 'facebook' | 'instagram' | 'twitter'; href: string; color: string }> = ({
    platform,
    href,
    color,
}) => {
    const Icon = {
        facebook: FacebookIcon,
        instagram: InstagramIcon,
        twitter: TwitterIcon,
    }[platform];

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 border"
            style={{ 
                backgroundColor: `${color}15`, 
                borderColor: `${color}40`,
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
    const primaryColor = selectedStore.theme?.primaryColor || '#0891b2';
    
    // Header links (same as in Header component)
    const headerLinks = [
        { label: "About", href: "#about" },
        { label: "Products", href: "#products" },
        { label: "Contact", href: "#contact" },
    ];

    return (
        <footer 
            className="text-white py-12"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${selectedStore.theme?.secondaryColor || primaryColor})` }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                            <h3 className="text-2xl font-bold text-white mb-4">{brandName}</h3>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col sm:flex-row items-center md:items-start gap-4 sm:gap-6">
                        {headerLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-white/90 hover:text-white transition-colors duration-200 text-sm font-medium"
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
                            <SocialIcon platform="twitter" href={socialLinks.twitter} color={primaryColor} />
                        )}
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/20 pt-6 mt-6">
                    <p className="text-center text-sm text-white/80">
                        &copy; {new Date().getFullYear()} {brandName}. {footerText}
                    </p>
                    <p className="text-center text-xs text-white/60 mt-2">
                        Powered by Yurafy
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

