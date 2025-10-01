
"use client";
import { motion } from "framer-motion";

export default function CallToAction() {
    return (
        <section className="py-20 bg-indigo-600 text-white text-center">
        <motion.h2
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            // transition={{ repeat: Infinity, duration: 2 }}
            className="text-4xl font-bold mb-6"
        >
            Ready to Grow Your Business with Yura IT?
        </motion.h2>
        <motion.button
            whileHover={{ scale: 1.1 }}
            className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded shadow hover:bg-gray-100 transition"
        >
            Get Started Now
        </motion.button>
        </section>
    );
}
