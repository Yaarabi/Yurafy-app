"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FaCheck } from "react-icons/fa";

export default function PlansSection() {
    const t = useTranslations("PlansSection");

    const plans = [
        {
        name: t("starter.name"),
        features: [t("starter.feature1"), t("starter.feature2")],
        price: t("starter.price"),
        },
        {
        name: t("whatsapp.name"),
        features: [t("whatsapp.feature1")],
        price: t("whatsapp.price"),
        },
        {
        name: t("aiAgent.name"),
        features: [t("aiAgent.feature1")],
        price: t("aiAgent.price"),
        },
        {
        name: t("creator.name"),
        features: [t("creator.feature1")],
        price: t("creator.price"),
        },
        {
        name: t("proSeller.name"),
        features: [t("proSeller.feature1")],
        price: t("proSeller.price"),
        },
        {
        name: t("visionary.name"),
        features: [t("visionary.feature1")],
        price: t("visionary.price"),
        highlighted: true,
        },
    ];

    return (
        <section className="py-20 bg-gray-50">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-gray-900">
            {t("title")}
        </h2>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
            {plans.map((plan, i) => {
            const { name, features, price, highlighted } = plan;
            return (
                <motion.div
                key={name}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl
                    ${highlighted
                    ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
                    : "bg-white border border-gray-200 hover:border-indigo-400"
                    }`}
                >
                {highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold bg-yellow-400 text-gray-900 rounded-full shadow-md">
                    {t("mostPopular")}
                    </span>
                )}
                <h3 className={`text-xl font-bold mb-4 ${highlighted ? "text-white" : "text-gray-900"}`}>
                    {name}
                </h3>
                <p className={`text-3xl font-extrabold mb-6 ${highlighted ? "text-yellow-300" : "text-indigo-600"}`}>
                    {price}
                </p>
                <ul className="space-y-2 mb-6">
                    {features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 ${highlighted ? "text-indigo-100" : "text-gray-700"}`}>
                        <FaCheck className="text-green-400 flex-shrink-0" /> {f}
                    </li>
                    ))}
                </ul>
                <button
                    className={`w-full py-3 rounded-lg font-semibold transition 
                    ${highlighted
                        ? "bg-white text-indigo-600 hover:bg-gray-100"
                        : "bg-indigo-500 text-white hover:bg-indigo-600"
                    }`}
                >
                    {t("choosePlan")}
                </button>
                </motion.div>
            );
            })}
        </div>
        </section>
    );
}
