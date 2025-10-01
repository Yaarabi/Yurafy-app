"use client";
import { FaInstagram, FaWhatsapp, FaLinkedin, FaYoutube } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-200 pt-16 pb-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
            <h2 className="text-2xl font-bold text-white mb-4">Yura IT</h2>
            <p className="text-gray-400 mb-4">
                Empowering Moroccan SMEs with AI-driven automation. Create, post, and grow effortlessly.
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
            <h3 className="text-xl font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Home</a></li>
                <li><a href="#" className="hover:text-white">Products</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
            </div>

            {/* Resources / Quick Links */}
            <div>
            <h3 className="text-xl font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">Terms & Privacy</a></li>
            </ul>
            </div>

            {/* Contact */}
            <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-400">Email: <a href="mailto:contact@yurait.com" className="hover:text-white">contact@yurait.com</a></p>
            <p className="text-gray-400">Phone: <a href="tel:+212600000000" className="hover:text-white">+212 600 000 000</a></p>
            <p className="text-gray-400 mt-4">Address: Casablanca, Morocco</p>
            </div>
        </div>

        <div className="mt-12 border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
            © 2025 Yura IT – All rights reserved.
        </div>
        </footer>
    );
}
