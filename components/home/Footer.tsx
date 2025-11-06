"use client";
import { FaInstagram, FaWhatsapp, FaLinkedin, FaYoutube } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function Footer() {
    const t = useTranslations("Footer");
    const params = useParams();
    const locale = params.locale || 'en';

    return (
        <footer className="bg-gray-900 text-gray-200 pt-16 pb-6">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Company Info */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">{t("companyName")}</h2>
                    <p className="text-gray-400 mb-4">
                        {t("companyDescription")}
                    </p>
                    <div className="flex gap-4 mt-2 text-xl text-gray-300">
                        <a href="#" aria-label="Instagram" className="hover:text-indigo-500"><FaInstagram /></a>
                        <a href="#" aria-label="WhatsApp" className="hover:text-green-500"><FaWhatsapp /></a>
                        <a href="#" aria-label="LinkedIn" className="hover:text-blue-500"><FaLinkedin /></a>
                        <a href="#" aria-label="YouTube" className="hover:text-red-500"><FaYoutube /></a>
                    </div>
                </div>

                {/* Navigation */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">{t("navigation.title")}</h3>
                    <ul className="space-y-2 text-gray-400">
                    <li><a href={`/${params.locale}#home`} className="hover:text-white">{t("navigation.home")}</a></li>
                    <li><a href={`/${params.locale}#features`} className="hover:text-white">{t("navigation.products")}</a></li>
                    <li><a href={`/${params.locale}#pricing`} className="hover:text-white">{t("navigation.pricing")}</a></li>
                    <li><a href={`/${params.locale}#about`} className="hover:text-white">{t("navigation.about")}</a></li>
                    <li><a href={`/${params.locale}#contact`} className="hover:text-white">{t("navigation.contact")}</a></li>
                    </ul>
                </div>

                {/* Resources / Quick Links */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">{t("resources.title")}</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href={`/${locale}/resources`} className="hover:text-white">{t("resources.resources")}</a></li>
                        <li><a href={`/${locale}/blog`} className="hover:text-white">{t("resources.blog")}</a></li>
                        <li><a href={`/${locale}/support`} className="hover:text-white">{t("resources.support")}</a></li>
                        <li><a href={`/${locale}/terms`} className="hover:text-white">{t("resources.terms")}</a></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">{t("contact.title")}</h3>
                    <p className="text-gray-400">{t("contact.email")}: <a href="mailto:contact@yurafy.com" className="hover:text-white">contact@yurafy.com</a></p>
                    <p className="text-gray-400">{t("contact.phone")}: <a href="tel:+212600000000" className="hover:text-white">+212 600 000 000</a></p>
                    <p className="text-gray-400 mt-4">{t("contact.address")}: Casablanca, Morocco</p>
                </div>
            </div>

            <div className="mt-12 border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
                {t("copyright")}
            </div>
        </footer>
    );
}