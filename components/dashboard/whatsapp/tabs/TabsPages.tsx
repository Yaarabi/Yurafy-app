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
    MessageCircle,
    Lock,
    ArrowUpCircle,
    Sparkles
} from "lucide-react";
import Link from "next/link";

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
    const [loading, setLoading] = useState(true); // Start with true to show loader
    const [availableTemplates, setAvailableTemplates] = useState<ITemplate[]>([]);
    const [userPlan, setUserPlan] = useState<string>("free");

    // Tab icons mapping
    const tabIcons: Record<string, any> = {
        "Connection": Plug,
        "Ai Agent": Bot,
        "Tools": Wrench,
        "Automation Settings": Settings,
        "Templates": FileText,
        "Test Panel": TestTube,
    };

    // All available tabs - show all tabs for everyone
    const tabs = [
        "Connection",
        "Ai Agent",
        "Tools",
        "Automation Settings",
        "Templates",
        "Test Panel",
    ];

    // Check if user has AI Agent access
    const hasAIAgentAccess = userPlan === "AI WhatsApp Agent" || userPlan === "Pro Seller" || userPlan === "Visionary";

    useEffect(() => {
        const fetchUserPlan = async () => {
            try {
                const res = await fetch("/api/user/plan");
                if (res.ok) {
                    const data = await res.json();
                    setUserPlan(data.planKey || "free");
                }
            } catch (err) {
                console.error("Failed to fetch user plan", err);
            }
        };

        const fetchAgent = async () => {
        try {
            const session = await getSession();
            const userId = session?.user?.id;
            if (!userId) {
            toast.error("User not authenticated");
            return;
            }

            const res = await fetch(`/api/ai-agent?owner=${userId}`);
            const data = await res.json();
            setAgent(data.agent || null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load agent settings");
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

        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchUserPlan(),
                    fetchAgent(),
                    fetchTemplates()
                ]);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, []);


    const updateAgent = async (payload: Record<string, unknown>) => {
        if (!agent) return;
        try {
        // Don't set loading to true here to avoid showing full page loader
        // Only show a toast notification
        const session = await getSession();
        const userId = session?.user?.id;
        if (!userId) {
            toast.error("User not authenticated");
            return;
        }

        const res = await fetch(`/api/ai-agent`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                owner: userId, // Ensure owner is always included
                ...payload 
            }),
        });
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Update failed");
        }
        
        const data = await res.json();
        setAgent(data.agent);
        toast.success("Agent updated");
        } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Update failed");
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
                                                    ? 'bg-[var(--brand-blue)] text-white shadow-lg shadow-[var(--brand-blue)]/50 ring-2 ring-[var(--brand-blue)]/30 dark:ring-[var(--brand-blue)]/50'
                                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[var(--brand-blue)]/10 dark:hover:bg-[var(--brand-blue)]/20 hover:text-[var(--brand-blue)] dark:hover:text-[var(--brand-blue)] border border-gray-200 dark:border-gray-700 hover:border-[var(--brand-blue)]/30 dark:hover:border-[var(--brand-blue)]/50'
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
                            <div className="w-1 h-1 rounded-full bg-[var(--brand-blue)] animate-pulse"></div>
                            <div className="w-1 h-1 rounded-full bg-[var(--brand-blue)] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1 h-1 rounded-full bg-[var(--brand-blue)] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
                        <div className="p-4 sm:p-6 lg:p-8">
                            {activeTab === "Connection" && <ConnectionTab />}

                            {/* AI Agent Tab - Show upgrade message if no access */}
                            {activeTab === "Ai Agent" && !hasAIAgentAccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-w-2xl mx-auto text-center py-12"
                                >
                                    <div className="w-20 h-20 bg-[var(--brand-blue)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                        <Sparkles className="w-10 h-10 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                        Upgrade to Use AI Agent
                                    </h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                                        The AI Agent feature is available in:
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                                        <div className="bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 border-2 border-[var(--brand-blue)]/30 dark:border-[var(--brand-blue)]/50 rounded-lg px-6 py-4">
                                            <div className="font-semibold text-[var(--brand-blue)] dark:text-[var(--brand-blue)]">AI WhatsApp Agent</div>
                                            <div className="text-sm text-[var(--brand-blue)]/80 dark:text-[var(--brand-blue)]/70">Dedicated AI plan</div>
                                        </div>
                                        <div className="bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 border-2 border-[var(--brand-blue)]/30 dark:border-[var(--brand-blue)]/50 rounded-lg px-6 py-4">
                                            <div className="font-semibold text-[var(--brand-blue)] dark:text-[var(--brand-blue)]">Visionary</div>
                                            <div className="text-sm text-[var(--brand-blue)]/80 dark:text-[var(--brand-blue)]/70">Premium plan</div>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        Enable intelligent conversations, automated responses, and AI-powered customer support.
                                    </p>
                                    <Link
                                        href="/onboarding/plan"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand-blue)] text-white rounded-lg font-semibold hover:bg-[var(--brand-blue)]/90 transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <ArrowUpCircle className="w-5 h-5" />
                                        Upgrade Now
                                    </Link>
                                </motion.div>
                            )}

                            {activeTab === "Ai Agent" && hasAIAgentAccess && agent && (
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

                            {/* Tools Tab - Show upgrade message if no access */}
                            {activeTab === "Tools" && !hasAIAgentAccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-w-2xl mx-auto text-center py-12"
                                >
                                    <div className="w-20 h-20 bg-[var(--brand-blue)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                        <Wrench className="w-10 h-10 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                        Upgrade to Access AI Tools
                                    </h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                                        AI Tools are available in:
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                                        <div className="bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 border-2 border-[var(--brand-blue)]/30 dark:border-[var(--brand-blue)]/50 rounded-lg px-6 py-4">
                                            <div className="font-semibold text-[var(--brand-blue)] dark:text-[var(--brand-blue)]">AI WhatsApp Agent</div>
                                            <div className="text-sm text-[var(--brand-blue)]/80 dark:text-[var(--brand-blue)]/70">Dedicated AI plan</div>
                                        </div>
                                        <div className="bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 border-2 border-[var(--brand-blue)]/30 dark:border-[var(--brand-blue)]/50 rounded-lg px-6 py-4">
                                            <div className="font-semibold text-[var(--brand-blue)] dark:text-[var(--brand-blue)]">Visionary</div>
                                            <div className="text-sm text-[var(--brand-blue)]/80 dark:text-[var(--brand-blue)]/70">Premium plan</div>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        Access advanced AI tools for enhanced automation, intelligent responses, and smart integrations.
                                    </p>
                                    <Link
                                        href="/onboarding/plan"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand-blue)] text-white rounded-lg font-semibold hover:bg-[var(--brand-blue)]/90 transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <ArrowUpCircle className="w-5 h-5" />
                                        Upgrade Now
                                    </Link>
                                </motion.div>
                            )}

                            {activeTab === "Tools" && hasAIAgentAccess && agent && (
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
