"use client";
import { FaInstagram, FaWhatsapp, FaLinkedin, FaYoutube, FaFacebook } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function Footer() {
    const t = useTranslations("Footer");
    const params = useParams();
    const locale = params.locale || 'en';
    const url = `https://wa.me/+212716413605?text=Bonjour,%20je%20veux%20plus%20le%20d'informations!:%20`;


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
                        <a href="https://www.instagram.com/yurafy_com" aria-label="Instagram" className="hover:text-indigo-500"><FaInstagram /></a>
                        <a href="https://www.facebook.com/profile.php?id=61580207967842" aria-label="Facebook" className="hover:text-green-500"><FaFacebook /></a>
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
                    <li><a href={`/${locale}/login`} className="hover:text-white">Login</a></li>
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
                        <li><a href={`/${locale}/services`} className="hover:text-white">{t("resources.services")}</a></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">{t("contact.title")}</h3>
                    <div className="space-y-3">
                        <a href="mailto:contact@yurafy.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                                </svg>
                            </div>
                            <span>Email</span>
                        </a>
                        <a href="https://wa.me/+212716413605" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                                <FaWhatsapp className="w-5 h-5" />
                            </div>
                            <span>Whatsapp</span>
                        </a>
                        <div className="flex items-center gap-3 text-gray-400 mt-4">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                                </svg>
                            </div>
                            <span>Agadir, Morocco</span>
                        </div>
                    </div>
                </div>
            </div>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 bg-green-500 hover:bg-green-600 text-white p-3 sm:p-4 rounded-full shadow-lg z-50 flex items-center justify-center transition"
                >
                    <FaWhatsapp className="text-lg sm:text-xl" />
            </a>  

            <div className="mt-12 border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
                {t("copyright")}
            </div>
        </footer>
    );
}