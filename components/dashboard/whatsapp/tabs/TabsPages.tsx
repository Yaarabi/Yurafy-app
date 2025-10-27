'use client';
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getSession } from "next-auth/react";

import ConnectionTab from "@/components/dashboard/whatsapp/tabs/ConnectionTab";
import AutomationTab from "../automation/AutomationTab";
import TemplatesTab from "@/components/dashboard/whatsapp/tabs/TemplatesTab";
import TestPanelTab from "@/components/dashboard/whatsapp/tabs/TestPanelTab";
import SettingsSection from "@/components/dashboard/setting/settingSection";
import WorkflowToggle from "../automation/WorkflowToggle";
import EditableField from "@/components/dashboard/setting/SettingsField";
import LogoLoader from "@/components/themePreview/loadder";

export default function WhatsAppIntegrationPage() {
    const [activeTab, setActiveTab] = useState("Connection");
    const [agent, setAgent] = useState<any>(null);
    const [loading, setLoading] = useState(false);

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

        fetchAgent();
    }, []);

    const updateAgent = async (payload: any) => {
        if (!agent) return;
        setLoading(true);
        try {
        const res = await fetch(`/api/ai-agent`, {
            method: "PUT",
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

    if (loading)
        return <LogoLoader/>;

    return (
        <div className="max-w-6xl mx-auto p-6 text-gray-800 dark:text-gray-100">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
            {tabs.map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-t-lg font-medium transition-all duration-200 ${
                activeTab === tab
                    ? "bg-[var(--brand-blue)]/20 text-[var(--brand-blue)] shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-[var(--brand-blue)]/10 hover:text-[var(--brand-blue)]"
                }`}
            >
                {tab}
            </button>
            ))}
        </div>

        {/* Active Tab Content */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-inner min-h-[400px] transition-colors duration-300 border border-gray-200 dark:border-gray-700">
            {activeTab === "Connection" && <ConnectionTab />}

            {activeTab === "Ai Agent" && agent && (
            <SettingsSection title="AI Agent Connection">
                <WorkflowToggle
                label="Enable AI Agent"
                enabled={agent.enabled}
                onChange={(v) => updateAgent({ enabled: v })}
                />
                <p className="text-sm text-gray-400 mt-2">
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
            <SettingsSection title="AI Agent Tools">
                <WorkflowToggle
                label="Order Confirmation"
                enabled={agent.tools.orderConfirmation}
                onChange={(v) =>
                    updateAgent({ tools: { ...agent.tools, orderConfirmation: v } })
                }
                />
                <WorkflowToggle
                label="Seller Messaging"
                enabled={agent.tools.sellerMessaging}
                onChange={(v) =>
                    updateAgent({ tools: { ...agent.tools, sellerMessaging: v } })
                }
                />
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-gray-600 dark:text-gray-400">Audio assets will appear here</p>
                </div>
            </SettingsSection>
            )}

            {activeTab === "Automation Settings" && <AutomationTab />}
            {activeTab === "Templates" && <TemplatesTab />}
            {activeTab === "Test Panel" && <TestPanelTab />}
        </div>
        </div>
    );
}
