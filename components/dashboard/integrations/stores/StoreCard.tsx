"use client";

import React from "react";
import { motion } from "framer-motion";

interface StoreCardProps {
    name: string;
    description: string;
    icon: string;
    iconBg?: string;
    onClick?: () => void;
    connected?: boolean;
    comingSoon?: boolean;
}

export default function StoreCard({ name, description, icon, iconBg = "", onClick, connected, comingSoon }: StoreCardProps) {
    return (
        <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            whileHover={{ y: -8 }}
            className={`group bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 p-6 ${comingSoon ? 'cursor-not-allowed' : 'cursor-pointer'} flex flex-col justify-between h-48`}
            onClick={() => { if (!comingSoon && onClick) onClick(); }}
        >
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <img src={icon} alt={name} className="w-10 h-10 object-contain" />
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
                </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
                <div>
                    {typeof connected === 'boolean' && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                            {connected ? 'Connected' : 'Disconnected'}
                        </span>
                    )}
                </div>

                <div>
                    { /* Coming soon state overrides action */ }
                    { comingSoon ? (
                        <button className="px-3 py-2 rounded-lg text-sm text-white bg-gray-400 dark:bg-gray-600 opacity-90 cursor-not-allowed">Soon</button>
                    ) : (
                        <button className="px-3 py-2 rounded-lg text-sm text-white bg-[var(--brand-blue)] shadow transition-all group-hover:scale-105">{
                            /* TODO: localize if needed */
                            connected ? 'Manage' : 'Connect'
                        }</button>
                    ) }
                </div>
            </div>
        </motion.div>
    );
}
