"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function CallToAction() {
    const t = useTranslations("CallToAction");

    return (
        <section className="py-20 bg-indigo-600 text-white text-center">
            <motion.h2
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                className="text-4xl font-bold mb-4"
            >
                {t("headline")}
            </motion.h2>
            <motion.button
                whileHover={{ scale: 1.1 }}
                className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded shadow hover:bg-gray-100 transition"
            >
                {t("cta")}
            </motion.button>
        </section>
    );
}