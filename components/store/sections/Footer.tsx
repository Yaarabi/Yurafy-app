import React from 'react';
import { useStore } from '../hooks/useStore';
import { FacebookIcon, InstagramIcon, TwitterIcon } from '../components/icons';

const SocialIcon: React.FC<{ platform: 'facebook' | 'instagram' | 'twitter'; href: string }> = ({
    platform,
    href,
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
            className="text-gray-400 hover:text-white transition-colors duration-200"
        >
            <span className="sr-only">{platform}</span>
            <Icon className="h-6 w-6" />
        </a>
    );
};

const Footer: React.FC = () => {
    const { selectedStore } = useStore();

    // Don't render anything if no store is selected
    if (!selectedStore) return null;

    // Use optional chaining + defaults to avoid crash
    const brandName = selectedStore.brandName || 'My Store';
    const footerText = selectedStore.footer?.text || 'All rights reserved.';
    const socialLinks = selectedStore.socialLinks || {};

    return (
        <footer className="bg-gray-800 text-white">
            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col items-center sm:flex-row sm:justify-between">
                    <p>
                        &copy; {new Date().getFullYear()} {brandName}. {footerText}
                    </p>
                    <div className="flex space-x-4 mt-4 sm:mt-0">
                        {socialLinks.facebook && (
                            <SocialIcon platform="facebook" href={socialLinks.facebook} />
                        )}
                        {socialLinks.instagram && (
                            <SocialIcon platform="instagram" href={socialLinks.instagram} />
                        )}
                        {socialLinks.twitter && (
                            <SocialIcon platform="twitter" href={socialLinks.twitter} />
                        )}
                    </div>
                </div>
                <p className="text-center text-sm text-gray-400 mt-8">
                    Powered by Modular Storefront
                </p>
            </div>
        </footer>
    );
};

export default Footer;
