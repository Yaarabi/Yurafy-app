

import { FaFacebookF, FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import Image from 'next/image';
import { Theme, sanitizeTheme } from '@/models/store';

export interface SerializedStoreForFooter {
    brandName?: string;
    logoUrl?: string;
    whoWeAre?: string;
    theme?: Theme;
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        linkedin?: string;
    };
}

interface LandingFooterProps {
    store: SerializedStoreForFooter;
    style?: React.CSSProperties;
}

export default function LandingFooter({ store, style }: LandingFooterProps) {
    const theme = sanitizeTheme(store.theme || {});

    const footerGradient =
        theme.gradient
            ? `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.via || theme.gradient.from}, ${theme.gradient.to})`
            : `linear-gradient(135deg, var(--secondary-color, #16a34a), var(--primary-color, #22c55e))`;

    return (
        <footer
            id="footer"
            className="mt-20 relative text-sm"
            style={{
                background: footerGradient,
                color: '#ffffff',
                fontFamily: theme.fontFamily || 'Inter, sans-serif',
                borderTop: '1px solid var(--border-color, #111827)',
                ...style,
            }}
        >
            <div className="absolute inset-0 opacity-10 bg-black"></div>

            <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {/* Brand */}
                <div className="flex flex-col items-start space-y-4">
                    {store.logoUrl ? (
                        <div className="relative w-14 h-14">
                            <Image
                                src={'/logo.png'}
                                alt={store.brandName || 'logo'}
                                fill
                                className="object-cover rounded-full shadow-md bg-white/20 backdrop-blur-sm"
                            />
                        </div>
                    ) : (
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold bg-white/20 backdrop-blur-sm">
                            {store.brandName?.charAt(0) || 'S'}
                        </div>
                    )}
                    <h2
                        className="text-xl font-extrabold tracking-wide"
                        style={{ fontWeight: 'var(--heading-weight, 700)' }}
                    >
                        {store.brandName}
                    </h2>
                    <p className="text-white/80 leading-relaxed">
                        {store.whoWeAre || 'Your trusted online store'}
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="font-semibold text-white mb-3">Quick Links</h3>
                    <ul className="space-y-2">
                        {['Home', 'Products', 'Order', 'Contact'].map((link, i) => (
                            <li key={i}>
                                <a
                                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                                    className="text-white/70 hover:text-white transition-all duration-200"
                                >
                                    {link}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="font-semibold text-white mb-3">Contact</h3>
                    <ul className="space-y-2">
                        {store.socialLinks?.twitter && (
                            <li>
                                <a
                                    href={`https://twitter.com/${store.socialLinks.twitter}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-white/80 hover:text-white transition-all"
                                >
                                    <FaEnvelope /> {store.socialLinks.twitter}
                                </a>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Socials */}
                <div>
                    <h3 className="font-semibold text-white mb-3">Follow Us</h3>
                    <div className="flex space-x-4 mt-2">
                        {store.socialLinks?.facebook && (
                            <a
                                href={store.socialLinks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-white/15 hover:bg-white/25 transition-all duration-200 text-white flex items-center justify-center"
                            >
                                <FaFacebookF />
                            </a>
                        )}
                        {store.socialLinks?.instagram && (
                            <a
                                href={store.socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-white/15 hover:bg-white/25 transition-all duration-200 text-white flex items-center justify-center"
                            >
                                <FaInstagram />
                            </a>
                        )}
                        {store.socialLinks?.twitter && (
                            <a
                                href={`https://twitter.com/${store.socialLinks.twitter}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-white/15 hover:bg-white/25 transition-all duration-200 text-white flex items-center justify-center"
                            >
                                <FaWhatsapp />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Line */}
            <div
                className="relative mt-6 pt-5 text-center text-white/70 text-sm"
                style={{ borderTop: '1px solid var(--border-color, #111827)' }}
            >
                &copy; {new Date().getFullYear()} {store.brandName || 'Yura IT'}. All rights reserved.
            </div>
        </footer>
    );
}
