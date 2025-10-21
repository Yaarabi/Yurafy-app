'use client';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import Image from 'next/image';

export default function LandingFooter({ store }: { store: any }) {
    return (
        <footer
            className="mt-12 border-t border-gray-200"
            style={{
                backgroundColor: 'var(--background-color)',
                color: 'var(--text-color)',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Brand */}
                <div className="flex flex-col items-start space-y-3">
                    {store.logoUrl ? (
                        <div className="relative w-12 h-12">
                            <Image
                                src={"/logo.png"} // here !!!!!!!!!!!!
                                alt={store.brandName}
                                fill
                                className="object-cover rounded-full"
                            />
                        </div>
                    ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                            {store.brandName?.charAt(0) || 'S'}
                        </div>
                    )}
                    <span className="text-lg font-bold">{store.brandName}</span>
                    <p className="text-gray-600 text-sm">
                        {store.whoWeAre || 'Your trusted online store'}
                    </p>
                </div>

                {/* Links */}
                <div className="flex flex-col space-y-2">
                    <h3 className="font-semibold text-gray-800">Links</h3>
                    <a href="#header" className="hover:text-[var(--primary-color)] transition">Home</a>
                    <a href="#products" className="hover:text-[var(--primary-color)] transition">Products</a>
                    <a href="#order-form" className="hover:text-[var(--primary-color)] transition">Order</a>
                    <a href="#footer" className="hover:text-[var(--primary-color)] transition">Contact</a>
                </div>

                {/* Contact */}
                <div className="flex flex-col space-y-2">
                    <h3 className="font-semibold text-gray-800">Contact</h3>
                    {store.socialLinks?.email && (
                        <a
                            href={`mailto:${store.socialLinks.email}`}
                            className="flex items-center gap-2 hover:text-[var(--primary-color)] transition"
                        >
                            <FaEnvelope /> {store.socialLinks.email}
                        </a>
                    )}
                    {store.socialLinks?.whatsapp && (
                        <a
                            href={`tel:${store.socialLinks.whatsapp}`}
                            className="flex items-center gap-2 hover:text-[var(--primary-color)] transition"
                        >
                            <FaWhatsapp /> {store.socialLinks.whatsapp}
                        </a>
                    )}
                </div>

                {/* Socials */}
                <div className="flex flex-col space-y-2">
                    <h3 className="font-semibold text-gray-800">Follow Us</h3>
                    <div className="flex space-x-3 mt-2">
                        {store.socialLinks?.facebook && (
                            <a
                                href={store.socialLinks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-white shadow-sm hover:shadow-md hover:text-blue-500 transition"
                            >
                                <FaFacebookF />
                            </a>
                        )}
                        {store.socialLinks?.instagram && (
                            <a
                                href={store.socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-white shadow-sm hover:shadow-md hover:text-pink-500 transition"
                            >
                                <FaInstagram />
                            </a>
                        )}
                        {store.socialLinks?.whatsapp && (
                            <a
                                href={`https://wa.me/${store.socialLinks.whatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-white shadow-sm hover:shadow-md hover:text-green-500 transition"
                            >
                                <FaWhatsapp />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 mt-6 pt-4 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Yura IT. All rights reserved.
            </div>
        </footer>
    );
}
