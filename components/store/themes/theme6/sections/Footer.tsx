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
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ backgroundColor: `${color}15`, color: color }}
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
    const footerText = selectedStore.footer?.text || 'All rights reserved.';
    const socialLinks = selectedStore.socialLinks || {};
    const primaryColor = selectedStore.theme?.primaryColor || '#3B82F6';

    return (
        <footer 
            className="text-white py-12"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${selectedStore.theme?.secondaryColor || primaryColor})` }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center sm:flex-row sm:justify-between gap-6">
                    <p className="text-center sm:text-left text-white/90">
                        &copy; {new Date().getFullYear()} {brandName}. {footerText}
                    </p>
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
                <p className="text-center text-sm text-white/70 mt-8">
                    Powered by Yurafy
                </p>
            </div>
        </footer>
    );
};

export default Footer;

