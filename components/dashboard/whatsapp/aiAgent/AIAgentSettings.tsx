'use client';
import SettingsSection from "@/components/dashboard/setting/settingSection";
import WorkflowToggle from "@/components/dashboard/whatsapp/automation/WorkflowToggle";
import EditableField from "@/components/dashboard/setting/SettingsField";
import { IAIAgent } from "@/models/ai-agent";

interface AIAgentSettingsProps {
    agent: IAIAgent;
    onUpdate: (payload: Record<string, unknown>) => Promise<void>;
}

export default function AIAgentSettings({ agent, onUpdate }: AIAgentSettingsProps) {
    return (
        <SettingsSection title="AI Agent Connection">
            <WorkflowToggle
                label="Enable AI Agent"
                enabled={agent.enabled}
                onChange={(v) => onUpdate({ enabled: v })}
            />
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Status: {agent.enabled ? "Connected" : "Disconnected"}
            </p>
            <EditableField
                label="Prompt / Personality"
                value={agent.prompt}
                onSave={(val) => onUpdate({ prompt: val })}
            />
        </SettingsSection>
    );
}
