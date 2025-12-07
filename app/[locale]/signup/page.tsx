'use client';

import BrandHeader from "@/components/login/brandHeader";
import Footer from '@/components/login/footer';
// Temporarily disabled: Signup form under maintenance
// import SignupForm from '@/components/login/signUpForm';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col justify-center items-center px-4" style={{ backgroundColor: '#f0f9ff' }}>
            {/* Background decorations */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(14,165,233,0.1),_transparent_60%)]"></div>
            
            {/* Geometric shapes */}
            {/* Large floating hexagons */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.15, scale: 1, rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-20 right-10 w-40 h-40 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" opacity="0.2" />
                </svg>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.15, scale: 1, rotate: [360, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-20 left-10 w-36 h-36 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" opacity="0.2" />
                </svg>
            </motion.div>
            
            {/* Medium hexagons */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.12, scale: 1, rotate: [0, -360] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/4 w-28 h-28 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" opacity="0.2" />
                </svg>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.1, scale: 1, rotate: [360, 0] }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/3 right-1/3 w-24 h-24 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" opacity="0.2" />
                </svg>
            </motion.div>
            
            {/* Circuit pattern nodes */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(14,165,233,0.4)' }}></div>
            <div className="absolute top-1/3 right-1/3 w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(14,165,233,0.4)' }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(14,165,233,0.4)' }}></div>
            <div className="absolute bottom-1/3 left-1/3 w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(14,165,233,0.4)' }}></div>
            
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                <line x1="25%" y1="25%" x2="33%" y2="33%" stroke="#0ea5e9" strokeWidth="1.5" />
                <line x1="67%" y1="33%" x2="75%" y2="25%" stroke="#0ea5e9" strokeWidth="1.5" />
                <line x1="75%" y1="75%" x2="67%" y2="67%" stroke="#0ea5e9" strokeWidth="1.5" />
                <line x1="33%" y1="67%" x2="25%" y2="75%" stroke="#0ea5e9" strokeWidth="1.5" />
            </svg>
            
            {/* Y letter geometric shape */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.08 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M50,10 L60,30 L70,30 L55,50 L55,90 L45,90 L45,50 L30,30 L40,30 Z" fill="#0ea5e9" />
                </svg>
            </motion.div>
            
            <div className="relative z-10 w-full max-w-md">
                {/* <SignupForm/> */}
                {/* Back button */}
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
                {/* Signup temporarily unavailable: feature under maintenance */}
                <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 p-4 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200">
                    <p className="font-semibold">Signup is under maintenance</p>
                    <p className="text-sm opacity-80">We're improving the experience. Please check back soon.</p>
                </div>
                <Footer />
            </div>
        </div>
    );
}
