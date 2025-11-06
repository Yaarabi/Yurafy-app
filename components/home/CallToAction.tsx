"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

export default function CallToAction() {
    const t = useTranslations("CallToAction");
    const router = useRouter();
    const params = useParams();

    const handleGetStarted = () => {
        const locale = params.locale || 'en';
        router.push(`/${locale}/signup`);
    };

    return (
        <section id="contact" className="relative overflow-hidden py-24 px-6 bg-blue-600 text-white text-center">
            {/* Background decorations */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            {/* Geometric shapes - Smart/tech inspired */}
            {/* Hexagon pattern */}
            <div className="absolute top-1/4 left-1/4 w-16 h-16 opacity-10 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="white" />
                </svg>
            </div>
            <div className="absolute bottom-1/4 right-1/4 w-20 h-20 opacity-10 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="white" />
                </svg>
            </div>
            
            {/* Circuit nodes */}
            <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-white/40 rounded-full"></div>
            <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-white/40 rounded-full"></div>
            
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none">
                <line x1="33%" y1="33%" x2="50%" y2="50%" stroke="white" strokeWidth="1.5" />
                <line x1="67%" y1="67%" x2="50%" y2="50%" stroke="white" strokeWidth="1.5" />
            </svg>
            
            {/* Y shape for Yurafy */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.1, scale: 1 }}
                transition={{ duration: 2, delay: 0.3 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M50,10 L50,50 L30,70 L50,50 L70,70" stroke="white" strokeWidth="3" fill="none" />
                </svg>
            </motion.div>
            
            <div className="relative max-w-4xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6"
                >
                    {t("headline")}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-xl md:text-2xl mb-8 text-blue-100"
                >
                    Join thousands of businesses growing with Yurafy
                </motion.p>
                <motion.button
                    onClick={handleGetStarted}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 bg-white text-blue-600 font-bold rounded-lg shadow-2xl hover:shadow-blue-300/50 transition-all duration-200 text-lg"
                >
                    {t("cta")}
                </motion.button>
            </div>
        </section>
    );
}