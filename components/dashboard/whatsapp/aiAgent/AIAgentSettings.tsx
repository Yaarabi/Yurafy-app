'use client';
import SettingsSection from "@/components/dashboard/setting/settingSection";
import WorkflowToggle from "@/components/dashboard/whatsapp/automation/WorkflowToggle";
import EditableField from "@/components/dashboard/setting/SettingsField";
import { IAIAgent } from "@/models/ai-agent";
import { useState } from "react";

interface AIAgentSettingsProps {
    agent: IAIAgent;
    updateAgent: (payload: Record<string, unknown>) => Promise<void>;
}

export default function AIAgentSettings({ agent, updateAgent }: AIAgentSettingsProps) {
    const [loading, setLoading] = useState(false);
    const handleToggle = async (v: boolean) => {
        setLoading(true);
        try {
            // Update AI agent (enabled only) and refresh UI
            await updateAgent({ enabled: v });
            // Update WhatsApp account (settings.aiAgent only)
            await fetch('/api/whatsapp/account', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: { aiAgent: v } }),
            });
            // Re-fetch agent data for UI sync
            await updateAgent({});
        } catch (err) {
            console.error('Failed to update agent/account:', err);
        } finally {
            setLoading(false);
        }
    };
    const handlePromptSave = async (val: string) => {
        setLoading(true);
        try {
            await updateAgent({ prompt: val });
        } catch (err) {
            console.error('Failed to update agent prompt:', err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <SettingsSection title="AI Agent Connection">
            <WorkflowToggle
                label="Enable AI Agent"
                enabled={agent.enabled}
                onChange={handleToggle}
                disabled={loading}
            />
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Status: {agent.enabled ? "Connected" : "Disconnected"}
            </p>
            <EditableField
                label="Prompt / Personality"
                value={agent.prompt}
                onSave={handlePromptSave}
                textarea={true}
            />
        </SettingsSection>
    );
}
