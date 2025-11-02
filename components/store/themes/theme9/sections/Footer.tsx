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
    const footerText = selectedStore.footer?.text || 'All rights reserved.';
    const socialLinks = selectedStore.socialLinks || {};
    const primaryColor = selectedStore.theme?.primaryColor || '#1F2937';

    return (
        <footer className="bg-white border-t border-gray-200 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center sm:flex-row sm:justify-between gap-8">
                    <p className="text-center sm:text-left text-gray-600 font-light">
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
                <p className="text-center text-sm text-gray-400 font-light mt-12">
                    Powered by Yurafy
                </p>
            </div>
        </footer>
    );
};

export default Footer;

