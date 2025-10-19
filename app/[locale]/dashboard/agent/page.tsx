
'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import SettingsSection from '@/components/dashboard/setting/settingSection';
import WorkflowToggle from '@/components/dashboard/whatsapp/tabs/automation/WorkflowToggle';
import EditableField from '@/components/dashboard/setting/SettingsField';

export default function AgentSettingsPage() {
  const [agent, setAgent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('AI Agent');
  const tabs = ['AI Agent', 'Tools', 'Personality'];

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await fetch(`/api/ai-agent?owner=me`);
        const data = await res.json();
        setAgent(data.agent);
      } catch (err) {
        toast.error("Failed to load agent settings");
      }
    };
    fetchAgent();
  }, []);

  const updateAgent = async (payload: any) => {
    try {
      const res = await fetch(`/api/ai-agent`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...agent, ...payload }),
      });
      const data = await res.json();
      setAgent(data.agent);
      toast.success("Agent updated");
    } catch {
      toast.error("Update failed");
    }
  };

  if (!agent) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'AI Agent' && (
        <SettingsSection title="AI Agent Connection">
          <WorkflowToggle
            label="Enable AI Agent"
            enabled={agent.enabled}
            onChange={v => updateAgent({ enabled: v })}
          />
          <p className="text-sm text-gray-400 mt-2">
            Status: {agent.enabled ? 'Connected' : 'Disconnected'}
          </p>
        </SettingsSection>
      )}

      {activeTab === 'Tools' && (
        <SettingsSection title="Agent Tools">
          <WorkflowToggle
            label="Order Confirmation"
            enabled={agent.tools.orderConfirmation}
            onChange={v => updateAgent({ tools: { ...agent.tools, orderConfirmation: v } })}
          />
          <WorkflowToggle
            label="Seller Messaging"
            enabled={agent.tools.sellerMessaging}
            onChange={v => updateAgent({ tools: { ...agent.tools, sellerMessaging: v } })}
          />
          {/* Audio assets + detection rules UI can be added here */}
        </SettingsSection>
      )}

      {activeTab === 'Personality' && (
        <SettingsSection title="Agent Personality">
          <EditableField
            label="Prompt / Personality"
            value={agent.prompt}
            onSave={val => updateAgent({ prompt: val })}
          />
        </SettingsSection>
      )}
    </div>
  );
}
