
"use client"
import React from "react";
import { FaMoneyBillWave, FaShieldAlt, FaTruck } from "react-icons/fa";
import { motion } from "framer-motion";

const trustItems = [
    {
        icon: FaMoneyBillWave,
        title: "Cash on Delivery",
        description: "Pay when your order arrives — safe and convenient.",
    },
    {
        icon: FaShieldAlt,
        title: "Secure Payments",
        description: "Your transactions are protected with top-tier encryption.",
    },
    {
        icon: FaTruck,
        title: "Fast Delivery",
        description: "Get your products quickly with our reliable shipping.",
    },
];

const TrustSection = () => {
    return (
        <section className="py-20 px-6 bg-[var(--primary-color)] text-[var(--text-color)]">
        <div className="max-w-screen-2xl mx-auto text-center px-4">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 max-md:text-3xl max-sm:text-2xl">
            TRUST IN US
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {trustItems.map((item, index) => {
                const Icon = item.icon;
                return (
                <motion.div
                    key={index}
                    className="flex flex-col items-center text-center gap-y-4 p-4 sm:p-6 rounded-lg bg-[var(--secondary-color)] hover:scale-105 transition-transform duration-300"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                    <Icon className="text-4xl sm:text-5xl text-white" />
                    <h3 className="text-lg sm:text-xl font-semibold mt-2">{item.title}</h3>
                    <p className="text-sm sm:text-sm max-w-xs">{item.description}</p>
                </motion.div>
                );
            })}
            </div>
        </div>
        </section>
    );
};

export default TrustSection;
