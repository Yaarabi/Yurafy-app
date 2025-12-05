'use client';

import BrandHeader from "@/components/login/brandHeader";
import Footer from '@/components/login/footer';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col justify-center items-center px-4 py-8" style={{ backgroundColor: '#f0f9ff' }}>
            {/* Background decorations */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(14,165,233,0.1),_transparent_60%)]"></div>
            
            {/* Geometric shapes */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.15, scale: 1, rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-20 right-10 w-40 h-40 pointer-events-none hidden sm:block"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" opacity="0.2" />
                </svg>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.15, scale: 1, rotate: [360, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-20 left-10 w-36 h-36 pointer-events-none hidden sm:block"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" opacity="0.2" />
                </svg>
            </motion.div>
            
            {/* Circuit pattern nodes */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(14,165,233,0.4)' }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(14,165,233,0.4)' }}></div>
            
            <div className="relative z-10 w-full max-w-md">
                <BrandHeader />
                <ForgotPasswordForm />
                <Footer />
            </div>
        </div>
    );
}

