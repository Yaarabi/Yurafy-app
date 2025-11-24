'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wrench, MessageCircle } from "lucide-react";

import ConnectionTab from "@/components/dashboard/whatsapp/tabs/ConnectionTab";
import AutomationTab from "@/components/dashboard/whatsapp/automation/AutomationTab";
import OrdersTriggersTab from "@/components/dashboard/whatsapp/ordersTriggers/OrdersTriggersTab";
import TemplatesTab from "@/components/dashboard/whatsapp/tabs/TemplatesTab";
import TestPanelTab from "@/components/dashboard/whatsapp/tabs/TestPanelTab";
import ToolsTab from "@/components/dashboard/whatsapp/tabs/ToolsTab";
import TabNavigation from "@/components/dashboard/whatsapp/navigation/TabNavigation";
import UpgradePrompt from "@/components/dashboard/whatsapp/common/UpgradePrompt";
import AIAgentSettings from "@/components/dashboard/whatsapp/aiAgent/AIAgentSettings";
import LogoLoader from "@/components/themePreview/loadder";
import { useWhatsAppData } from "@/hooks/whatsapp/useWhatsAppData";

interface WhatsAppIntegrationPageProps {
    onLoadingChange?: (loading: boolean) => void;
}

const TABS = [
    'connection',
    'aiAgent',
    'tools',
    'automation',
    'ordersTriggers',
    'templates',
    'testPanel',
];

const UPGRADE_PLANS = [
    { name: "AI WhatsApp Agent", description: "Dedicated AI plan" },
    { name: "Visionary", description: "Premium plan" }
];

export default function WhatsAppIntegrationPage({ onLoadingChange }: WhatsAppIntegrationPageProps = {}) {
    const [activeTab, setActiveTab] = useState("connection");
    const { data, loading, updateAgent } = useWhatsAppData();

    // Notify parent of loading state changes - only when loading changes
    useEffect(() => {
        onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    if (loading) return <LogoLoader />;

    const hasAIAgentAccess = data?.plan.hasAIAgentAccess ?? false;
    const agent = data?.aiAgent;
    const templates = data?.templates ?? [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="p-2 bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-lg">
                        <MessageCircle className="w-6 h-6 text-[var(--brand-blue)]" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                        WhatsApp Automation
                    </h2>
                </motion.div>

                <TabNavigation 
                    activeTab={activeTab} 
                    tabs={TABS} 
                    onTabChange={setActiveTab} 
                />

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
                            {activeTab === "connection" && <ConnectionTab />}

                            {activeTab === "aiAgent" && !hasAIAgentAccess && (
                                <UpgradePrompt
                                    icon={Sparkles}
                                    title="Upgrade to Use AI Agent"
                                    description="The AI Agent feature is available in:"
                                    plans={UPGRADE_PLANS}
                                />
                            )}

                            {activeTab === "aiAgent" && hasAIAgentAccess && agent && (
                                <AIAgentSettings agent={agent} updateAgent={updateAgent} />
                            )}

                            {activeTab === "tools" && !hasAIAgentAccess && (
                                <UpgradePrompt
                                    icon={Wrench}
                                    title="Upgrade to Access AI Tools"
                                    description="AI Tools are available in:"
                                    plans={UPGRADE_PLANS}
                                />
                            )}

                            {activeTab === "tools" && hasAIAgentAccess && agent && (
                                <ToolsTab
                                    agent={agent}
                                    availableTemplates={templates}
                                    updateAgent={updateAgent}
                                />
                            )}

                            {activeTab === "automation" && <AutomationTab />}
                            {activeTab === "ordersTriggers" && <OrdersTriggersTab />}
                            {activeTab === "templates" && <TemplatesTab />}
                            {activeTab === "testPanel" && <TestPanelTab />}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
