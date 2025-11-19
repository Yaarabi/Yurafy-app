'use client';
import { motion } from 'framer-motion';

interface TabNavigationProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    tabIcons: Record<string, any>;
    t: (key: string) => string;
}

export default function TabNavigation({ tabs, activeTab, onTabChange, tabIcons, t }: TabNavigationProps) {
    return (
        <div className="mb-3 sm:mb-8 relative">
            <div className="fixed bottom-0 left-0 right-0 z-40 sm:static sm:z-auto bg-white dark:bg-gray-900 border-t sm:border-0 border-gray-200 dark:border-gray-700 p-2 sm:p-0">
                <div className="overflow-x-auto scrollbar-hide sm:-mx-4 sm:mx-0 sm:px-0 px-2 scroll-smooth">
                    <div className="flex gap-2 sm:gap-3 min-w-max sm:min-w-0 sm:flex-wrap sm:justify-center items-center">
                        {tabs.map((tab, index) => {
                            const Icon = tabIcons[tab];
                            const isActive = activeTab === tab;
                            return (
                                <motion.button
                                    key={tab}
                                    onClick={() => onTabChange(tab)}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 
                                        rounded-lg font-medium 
                                        transition-all duration-200 whitespace-nowrap
                                        text-sm sm:text-base relative
                                        ${
                                            isActive
                                                ? 'bg-[var(--brand-blue)] text-white shadow-lg shadow-[var(--brand-blue)]/50 ring-2 ring-[var(--brand-blue)]/30 dark:ring-[var(--brand-blue)]/50'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[var(--brand-blue)]/10 dark:hover:bg-[var(--brand-blue)]/20 hover:text-[var(--brand-blue)] dark:hover:text-[var(--brand-blue)] border border-gray-200 dark:border-gray-700 hover:border-[var(--brand-blue)]/30 dark:hover:border-[var(--brand-blue)]/50'
                                        }
                                    `}
                                >
                                    {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
                                    <span className="font-medium">{t(`tabs.${tab}`)}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute bottom-0 left-0 right-0 h-1 bg-white/50 rounded-full hidden sm:block"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="h-14 sm:hidden" />
        </div>
    );
}
