"use client";
import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function TestimonialsSection() {
    const t = useTranslations("TestimonialsSection");

    const testimonials = [
        { 
            quote: t("testimonial1.quote"), 
            name: t("testimonial1.name") 
        },
        { 
            quote: t("testimonial2.quote"), 
            name: t("testimonial2.name") 
        },
    ];

    return (
        <section className="py-20 bg-blue-100">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-14 text-gray-900">
                {t("title")}
            </h2>
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 px-6">
                {testimonials.map((t, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="relative p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300"
                    >
                        <FaQuoteLeft className="absolute top-4 left-4 text-indigo-300 text-3xl opacity-30" />
                        <p className="text-gray-700 text-lg leading-relaxed italic">"{t.quote}"</p>
                        <p className="mt-6 font-semibold text-indigo-600">— {t.name}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}