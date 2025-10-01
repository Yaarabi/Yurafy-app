
"use client";
import { motion } from "framer-motion";

const plans = [
    { name: "Seller", features: ["Product pages", "AI content"], price: "Free" },
    { name: "Insta Bot", features: ["Seller + Instagram automation"], price: "$10/mo" },
    { name: "WhatsApp Bot", features: ["Seller + WhatsApp automation"], price: "$20/mo" },
    { name: "Pro", features: ["All features included"], price: "$30/mo", highlighted: true },
];

export default function PlansSection() {
    return (
        <section className="py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-10">Flexible Plans to Fit Your Business</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
            <motion.div
                key={plan.name}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-xl shadow-lg bg-white border ${
                plan.highlighted ? "border-indigo-500" : "border-gray-200"
                }`}
            >
                {plan.highlighted && (
                <span className="inline-block px-3 py-1 text-xs font-semibold bg-indigo-500 text-white rounded-full mb-3">
                    Most Popular
                </span>
                )}
                <h3 className="text-xl font-bold mb-4">{plan.name}</h3>
                <p className="text-3xl font-extrabold mb-4">{plan.price}</p>
                <ul className="space-y-2 mb-4">
                {plan.features.map((f) => (
                    <li key={f} className="text-gray-700">• {f}</li>
                ))}
                </ul>
                <button className="w-full py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition">
                Choose Plan
                </button>
            </motion.div>
            ))}
        </div>
        </section>
    );
}
