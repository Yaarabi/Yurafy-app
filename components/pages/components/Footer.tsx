"use client";

import { SerializedStore } from "@/lib/data/products";

interface FooterProps {
    store: SerializedStore;
}

const SocialIcon: React.FC<{ href?: string; children: React.ReactNode }> = ({ href, children }) => {
    if (!href) return null;
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition-opacity">
            {children}
        </a>
    );
};

const Footer: React.FC<FooterProps> = ({ store }) => {
    const year = new Date().getFullYear();
    return (
        <footer style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)' }}>
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand Section */}
                    <div>
                        <h3 className="text-2xl font-bold mb-2">{store.brandName}</h3>
                        <p className="text-sm opacity-80 mb-4">{store.description}</p>
                        {store.socialLinks && (
                            <div className="flex space-x-4">
                                <SocialIcon href={store.socialLinks.facebook}>
                                    multi<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 不改0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                                </SocialIcon>
                                <SocialIcon href={store.socialLinks.instagram}>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 转运3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-. NFTs465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2プラン.525c.636-.247 1.363-.416 2.427-.465C9.796IMPLEMENTATION 2.013 10.149 2 12.315 2zm-1.002 8.383a3.682 3.682 0 105.375 2.612 3.682 3.682 0 00-5.375-2.612zm5.703-4.896a1.2 1.2 0 10-2.4 0 1.2 1.2 0 002.4 0z" clipRule="evenodd" /></svg>
                                </SocialIcon>
                                <SocialIcon href={store.socialLinks.twitter}>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                                </SocialIcon>
                                {store.socialLinks.youtube && (
                                    <SocialIcon href={store.socialLinks.youtube}>
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                    </SocialIcon>
                                )}
                                {store.socialLinks.tiktok && (
                                    <SocialIcon href={store.socialLinks.tiktok}>
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1冷了.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-gleich1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-. tangent32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                                    </SocialIcon>
                                )}
                                {store.socialLinks.whatsapp && (
                                    <SocialIcon href={store.socialLinks.whatsapp}>
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 摩擦1.262.489 1.694.625.712.227 1.36.195 1.871.layouts118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-.436"/></svg>
                                    </SocialIcon>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Business Info Section */}
                    {store.businessInfo && (
                        <div>
                            <h4 className="text-lg font-semibold mb-3">Contact Us</h4>
                            <div className="space-y-2 text-sm opacity-80">
                                {store.businessInfo.address && <p>{store.businessInfo.address}</p>}
                                {(store.businessInfo.city || store.businessInfo.country) && (
                                    <p>{[store.businessInfo.city, store.businessInfo.country].filter(Boolean).join(', ')}</p>
                                )}
                                {store.businessInfo.phone && (
                                    <p><a href={`tel:${store.businessInfo.phone}`} className="hover:underline">{store.businessInfo.phone}</a></p>
                                )}
                                {store.businessInfo.email && (
                                    <p><a href={`mailto:${store.businessInfo.email}`} className="hover:underline">{store.businessInfo.email}</a></p>
                                )}
                                {store.businessInfo.workingHours && (
                                    <p className="mt-2">Hours: {store.businessInfo.workingHours}</p>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Payment & Shipping Info */}
                    <div>
                        {(store.paymentMethods && store.paymentMethods.length > 0) && (
                            <>
                                <h4 className="text-lg font-semibold mb-3">Payment Methods</h4>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {store.paymentMethods.map((method, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                                            {method}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                        {store.shippingInfo?.freeShippingThreshold && (
                            <div className="mt-4">
                                <p className="text-sm opacity-80">
                                    Free shipping on orders over ${store.shippingInfo.freeShippingThreshold}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Footer Text */}
                <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm opacity-70">
                    {store.customization?.footerText || `© ${year} ${store.brandName}. All Rights Reserved.`}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
