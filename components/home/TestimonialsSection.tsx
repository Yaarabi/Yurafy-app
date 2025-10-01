
"use client";
import { motion } from "framer-motion";

const testimonials = [
    { quote: "Yura IT made posting on Instagram effortless — my products reach more clients than ever.", name: "Fatima, Artisan" },
    { quote: "AI descriptions save me hours every week. The WhatsApp bot keeps my customers informed instantly.", name: "Youssef, Retailer" },
];

export default function TestimonialsSection() {
    return (
        <section className="py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-10">What Our Sellers Say</h2>
        <div className="max-w-4xl mx-auto space-y-8">
            {testimonials.map((t, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="p-6 bg-gray-50 rounded-xl shadow"
            >
                <p className="text-gray-800 italic">"{t.quote}"</p>
                <p className="mt-4 font-semibold text-gray-900">{t.name}</p>
            </motion.div>
            ))}
        </div>
        </section>
    );
}
