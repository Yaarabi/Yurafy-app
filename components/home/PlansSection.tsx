"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function PlansSection() {
    const t = useTranslations("PlansSection");

    const plans = [
        {
            name: t("seller.name"),
            features: [t("seller.feature1"), t("seller.feature2")],
            price: t("seller.price"),
        },
        {
            name: t("instabot.name"),
            features: [t("instabot.feature1")],
            price: t("instabot.price"),
        },
        {
            name: t("whatsappbot.name"),
            features: [t("whatsappbot.feature1")],
            price: t("whatsappbot.price"),
        },
        {
            name: t("pro.name"),
            features: [t("pro.feature1")],
            price: t("pro.price"),
            highlighted: true,
        },
    ];

    return (
        <section className="py-20 bg-white">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-gray-900">
                {t("title")}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-6">
                {plans.map((plan, i) => (
                    <motion.div
                        key={plan.name}
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`relative p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl 
                        ${plan.highlighted 
                            ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0" 
                            : "bg-white border border-gray-200 hover:border-indigo-400"
                        }`}
                    >
                        {plan.highlighted && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold bg-yellow-400 text-gray-900 rounded-full shadow-md">
                                {t("mostPopular")}
                            </span>
                        )}
                        <h3 className={`text-xl font-bold mb-4 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                            {plan.name}
                        </h3>
                        <p className={`text-3xl font-extrabold mb-6 ${plan.highlighted ? "text-yellow-300" : "text-indigo-600"}`}>
                            {plan.price}
                        </p>
                        <ul className="space-y-2 mb-6">
                            {plan.features.map((f) => (
                                <li
                                    key={f}
                                    className={`flex items-center gap-2 ${
                                        plan.highlighted ? "text-indigo-100" : "text-gray-700"
                                    }`}
                                >
                                    ✅ {f}
                                </li>
                            ))}
                        </ul>
                        <button
                            className={`w-full py-3 rounded-lg font-semibold transition 
                                ${plan.highlighted 
                                ? "bg-white text-indigo-600 hover:bg-gray-100" 
                                : "bg-indigo-500 text-white hover:bg-indigo-600"
                                }`}
                        >
                            {t("choosePlan")}
                        </button>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}