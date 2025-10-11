'use client';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { capitalizeFirstLetter } from './ProductHeader';

interface IOwner {
    name: string;
    brandName?: string;
    logo?: string;
    email?: string;
    phone?: string;
}

export default function LandingFooter({ owner }: { owner: IOwner }) {
    const t = useTranslations('footer');
    const brandName = capitalizeFirstLetter(owner.brandName || owner.name);

    return (
        <footer className="bg-gradient-to-t from-gray-100 to-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="flex flex-col items-start space-y-3">
            {owner.logo ? (
                <div className="relative w-12 h-12">
                <Image
                    src={owner.logo}
                    alt={owner.brandName || owner.name}
                    fill
                    className="object-cover rounded-full"
                />
                </div>
            ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                {owner.name}
                </div>
            )}
            <span className="text-lg font-bold text-gray-900">{brandName || owner.name}</span>
            <p className="text-gray-600 text-sm">{t('brandSlogan')}</p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col space-y-2">
            <h3 className="font-semibold text-gray-800">{t('quickLinks')}</h3>
            <a href="#header" className="text-gray-600 hover:text-blue-500 transition">{t('home')}</a>
            <a href="#products" className="text-gray-600 hover:text-blue-500 transition">{t('products')}</a>
            <a href="#order-form" className="text-gray-600 hover:text-blue-500 transition">{t('order')}</a>
            <a href="#footer" className="text-gray-600 hover:text-blue-500 transition">{t('contact')}</a>
            </div>

            {/* Contact */}
            <div className="flex flex-col space-y-2">
            <h3 className="font-semibold text-gray-800">{t('contact')}</h3>
            {owner.email && (
                <a href={`mailto:${owner.email}`} className="text-gray-600 hover:text-blue-500 transition flex items-center gap-2">
                <FaEnvelope /> {owner.email}
                </a>
            )}
            {owner.phone && (
                <a href={`tel:${owner.phone}`} className="text-gray-600 hover:text-blue-500 transition flex items-center gap-2">
                <FaWhatsapp /> {owner.phone}
                </a>
            )}
            </div>

            {/* Socials */}
            <div className="flex flex-col space-y-2">
            <h3 className="font-semibold text-gray-800">{t('followUs')}</h3>
            <div className="flex space-x-3 mt-2">
                <a href="#" className="text-gray-600 hover:text-blue-500 transition p-2 rounded-full bg-white shadow-sm hover:shadow-md">
                <FaFacebookF />
                </a>
                <a href="#" className="text-gray-600 hover:text-pink-500 transition p-2 rounded-full bg-white shadow-sm hover:shadow-md">
                <FaInstagram />
                </a>
                <a href="#" className="text-gray-600 hover:text-green-500 transition p-2 rounded-full bg-white shadow-sm hover:shadow-md">
                <FaWhatsapp />
                </a>
            </div>
            </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 mt-6 pt-4 text-center text-gray-500 text-sm">
            <a href="/" className="text-gray-600 hover:text-blue-500 transition"> &copy; {new Date().getFullYear()} Yura IT. {t('rightsReserved')}</a>
        </div>
        </footer>
    );
}
