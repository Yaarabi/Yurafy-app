'use client';
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Plug, 
    Bot, 
    Wrench, 
    Settings, 
    FileText, 
    TestTube,
    MessageCircle 
} from "lucide-react";

import ConnectionTab from "@/components/dashboard/whatsapp/tabs/ConnectionTab";
import AutomationTab from "../automation/AutomationTab";
import TemplatesTab from "@/components/dashboard/whatsapp/tabs/TemplatesTab";
import TestPanelTab from "@/components/dashboard/whatsapp/tabs/TestPanelTab";
import SettingsSection from "@/components/dashboard/setting/settingSection";
import WorkflowToggle from "../automation/WorkflowToggle";
import EditableField from "@/components/dashboard/setting/SettingsField";
import LogoLoader from "@/components/themePreview/loadder";
import { ITemplate } from "@/models/templates";
import { IAIAgent } from "@/models/ai-agent";
import ToolsTab from "@/components/dashboard/whatsapp/tabs/ToolsTab";

export default function WhatsAppIntegrationPage() {
    const [activeTab, setActiveTab] = useState("Connection");
    const [agent, setAgent] = useState<IAIAgent | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [availableTemplates, setAvailableTemplates] = useState<ITemplate[]>([]);

    // Tab icons mapping
    const tabIcons: Record<string, any> = {
        "Connection": Plug,
        "Ai Agent": Bot,
        "Tools": Wrench,
        "Automation Settings": Settings,
        "Templates": FileText,
        "Test Panel": TestTube,
    };

    const tabs = [
        "Connection",
        "Ai Agent",
        "Tools",
        "Automation Settings",
        "Templates",
        "Test Panel",
    ];

    useEffect(() => {
        const fetchAgent = async () => {
        setLoading(true);
        try {
            const session = await getSession();
            const userId = session?.user?.id;
            if (!userId) {
            toast.error("User not authenticated");
            setLoading(false);
            return;
            }

            const res = await fetch(`/api/ai-agent?owner=${userId}`);
            const data = await res.json();
            setAgent(data.agent || null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load agent settings");
        } finally {
            setLoading(false);
        }
        };

        const fetchTemplates = async () => {
        try {
            const res = await fetch("/api/whatsapp/templates");
            const data = await res.json();
            setAvailableTemplates(data.templates || []);
        } catch (err) {
            console.error("Failed to fetch templates", err);
            toast.error("Could not load templates");
        }
        };

        fetchAgent();
        fetchTemplates();
    }, []);

    const updateAgent = async (payload: any) => {
        if (!agent) return;
        try {
        const res = await fetch(`/api/ai-agent`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...agent, ...payload }),
        });
        const data = await res.json();
        setAgent(data.agent);
        toast.success("Agent updated");
        } catch (err) {
        console.error(err);
        toast.error("Update failed");
        } finally {
        setLoading(false);
        }
    };

    if (loading) return <LogoLoader />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Tabs Navigation - Mobile Scrollable with Smart UX */}
                <div className="mb-6 sm:mb-8 relative">
                    {/* Scrollable Tabs Container */}
                    <div className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0 scroll-smooth">
                        <div className="flex gap-2 sm:gap-3 min-w-max sm:min-w-0 sm:flex-wrap sm:justify-center">
                            {tabs.map((tab, index) => {
                                const Icon = tabIcons[tab];
                                const isActive = activeTab === tab;
                                return (
                                    <motion.button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`
                                            flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-2.5 
                                            rounded-xl sm:rounded-lg font-medium 
                                            transition-all duration-200 whitespace-nowrap
                                            text-sm sm:text-base
                                            relative
                                            ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-300 dark:ring-indigo-700'
                                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                                            }
                                        `}
                                    >
                                        {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
                                        <span className="font-medium">{tab}</span>
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
                    
                    {/* Mobile Scroll Indicator */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 sm:hidden pointer-events-none">
                        <div className="flex gap-1 opacity-50">
                            <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse"></div>
                            <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                </div>

                {/* Tab Content - Animated */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[400px]"
                    >
                            {activeTab === "Connection" && <ConnectionTab />}

                            {activeTab === "Ai Agent" && agent && (
                                <SettingsSection title="AI Agent Connection">
                                    <WorkflowToggle
                                        label="Enable AI Agent"
                                        enabled={agent.enabled}
                                        onChange={(v) => updateAgent({ enabled: v })}
                                    />
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                        Status: {agent.enabled ? "Connected" : "Disconnected"}
                                    </p>
                                    <EditableField
                                        label="Prompt / Personality"
                                        value={agent.prompt}
                                        onSave={(val) => updateAgent({ prompt: val })}
                                    />
                                </SettingsSection>
                            )}

                            {activeTab === "Tools" && agent && (
                                <ToolsTab
                                    agent={agent}
                                    availableTemplates={availableTemplates}
                                    updateAgent={updateAgent}
                                />
                            )}

                            {activeTab === "Automation Settings" && <AutomationTab />}
                            {activeTab === "Templates" && <TemplatesTab />}
                            {activeTab === "Test Panel" && <TestPanelTab />}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
