'use client';
import TemplateSelector from "../automation/TemplateSelector";
import SettingsSection from "@/components/dashboard/setting/settingSection";
import { IAIAgent } from "@/models/ai-agent";
import { ITemplate } from "@/models/templates";
import toast from "react-hot-toast";
import { useState } from "react";
import { Trash2, Save, X, ToggleLeft, ToggleRight } from "lucide-react";
import { useTranslations } from 'next-intl';

interface ToolsTabProps {
    agent: IAIAgent;
    availableTemplates: ITemplate[];
    updateAgent: (payload: any) => Promise<void>;
}

// All available tools with their descriptions
const AVAILABLE_TOOLS = [
    { name: "search_order", description: "Search for customer orders by name, phone, ID, or status", category: "Orders" },
    { name: "update_order_status", description: "Update the status of an existing order", category: "Orders" },
    { name: "create_order", description: "Create a new order for a customer", category: "Orders" },
    { name: "search_product", description: "Search for products by name, category, brand, or slug", category: "Products" },
    { name: "store_agent_action", description: "Store or update what the AI agent did or observed about a customer", category: "Memory" },
    { name: "get_agent_memory", description: "Retrieve stored summary of previous actions or customer situations", category: "Memory" },
    { name: "brand_info_retrieval", description: "Search through brand's uploaded knowledge (manuals, FAQs, documents)", category: "Brand Info" },
    { name: "template_guide", description: "Suggests relevant templates to use when responding to customers", category: "Templates" },
    { name: "send_template", description: "Send an approved WhatsApp template message to a customer", category: "Templates" },
];

export default function ToolsTab({ agent, availableTemplates, updateAgent }: ToolsTabProps) {
    const t = useTranslations('whatsapp.tools');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [savingFile, setSavingFile] = useState(false);
    const [updatingTool, setUpdatingTool] = useState<string | null>(null);

    // Save file & generate embeddings
    const handleSaveFile = async () => {
        if (!selectedFile) return;
        setSavingFile(true);

        try {
        // 1. Upload file
        const { uploadFile } = await import('@/lib/utils/upload');
        const result = await uploadFile(selectedFile);
        if (!result.success) throw new Error(result.error.message || "Upload failed");
        const fileUrl = result.data.url;

        // 2. Update agent
        await updateAgent({ file: fileUrl });
        toast.success(t('file.saved'));

        // 3. Generate embeddings
        const embedRes = await fetch("/api/ai-agent/embed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agentId: agent._id }),
        });
        if (!embedRes.ok) throw new Error("Embedding failed");
        toast.success(t('file.embeddingsGenerated'));

        setSelectedFile(null);
        } catch (err) {
        console.error(err);
        toast.error((err as Error).message || "File save failed");
        } finally {
        setSavingFile(false);
        }
    };

    // Delete file & embeddings
    const handleDeleteFileAndChunks = async () => {
        if (!agent.file) return;

        try {
        // Delete embeddings
        const delRes = await fetch(`/api/ai-agent/embed?agentId=${agent._id}`, { method: "DELETE" });
        if (!delRes.ok) throw new Error("Failed to delete embeddings");

        // Delete file
        const fileDelRes = await fetch("/api/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls: [agent.file] }),
        });
        if (!fileDelRes.ok) throw new Error("Failed to delete file");

        // Update agent
        await updateAgent({ file: "" });
        toast.success(t('file.deleted'));
        } catch (err) {
        console.error(err);
        toast.error(t('file.deleteError'));
        }
    };

    // Handle tool toggle
    const handleToolToggle = async (toolName: string, enabled: boolean) => {
        setUpdatingTool(toolName);
        try {
            const currentEnabledTools = agent.enabledTools || {};
            const updatedEnabledTools = {
                ...currentEnabledTools,
                [toolName]: enabled,
            };
            
            // Update agent without causing page refresh
            await updateAgent({ enabledTools: updatedEnabledTools });
            toast.success(enabled ? t('tool.enabled', { tool: toolName }) : t('tool.disabled', { tool: toolName }));
        } catch (err) {
            console.error(err);
            toast.error(t('tool.updateError'));
        } finally {
            setUpdatingTool(null);
        }
    };

    // Check if a tool is enabled (defaults to true if not set)
    const isToolEnabled = (toolName: string): boolean => {
        const enabledTools = agent.enabledTools || {};
        return enabledTools[toolName] !== false; // Default to enabled if not explicitly set
    };

    // Group tools by category
    const toolsByCategory = AVAILABLE_TOOLS.reduce((acc, tool) => {
        if (!acc[tool.category]) {
            acc[tool.category] = [];
        }
        acc[tool.category].push(tool);
        return acc;
    }, {} as Record<string, typeof AVAILABLE_TOOLS>);

    return (
        <div className="space-y-6">
        {/* Tools Enable/Disable Section */}
        <SettingsSection title={t('section.tools.title')}>
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('section.tools.description')}
                </p>
                
                {Object.entries(toolsByCategory).map(([category, tools]) => (
                    <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                            {t(`categories.${category}`, { defaultValue: category })}
                        </h3>
                        <div className="space-y-3">
                            {tools.map((tool) => {
                                const enabled = isToolEnabled(tool.name);
                                const isUpdating = updatingTool === tool.name;
                                
                                return (
                                    <div
                                        key={tool.name}
                                        className="flex items-start justify-between gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {t(`tools.${tool.name}.name`, { defaultValue: tool.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })}
                                                </span>
                                                {enabled && (
                                                    <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                                        {t('tool.enabledLabel')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {t(`tools.${tool.name}.description`, { defaultValue: tool.description })}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleToolToggle(tool.name, !enabled);
                                            }}
                                            disabled={isUpdating}
                                            className={`flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 ${
                                                enabled
                                                    ? 'bg-[var(--brand-blue)]'
                                                    : 'bg-gray-300 dark:bg-gray-600'
                                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            aria-label={enabled ? t('tool.disable', { tool: tool.name }) : t('tool.enable', { tool: tool.name })}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    enabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </SettingsSection>

        {/* Existing templates */}
        <SettingsSection title={t('section.templates.title')}>
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {t('section.templates.label')}
            </label>
            {agent.templates && agent.templates.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
                {agent.templates.map((tpl, idx) => (
                <li
                    key={idx}
                    className="flex items-center justify-between text-gray-800 dark:text-gray-100"
                >
                    <span>{tpl}</span>
                    <button
                    onClick={async () => {
                        try {
                        const updated = agent.templates.filter((t) => t !== tpl);
                        await updateAgent({ templates: updated });
                        toast.success(t('template.deleted', { template: tpl }));
                        } catch (err) {
                        console.error(err);
                        toast.error(t('template.deleteError'));
                        }
                    }}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                    <Trash2 size={16} />
                    </button>
                </li>
                ))}
            </ul>
            ) : (
            <p className="text-gray-500 dark:text-gray-300">{t('template.empty')}</p>
            )}

            <TemplateSelector
            label={t('template.addLabel')}
            templates={availableTemplates}
            selected=""
            onChange={async (name) => {
                if (!name) return;
                if (agent.templates?.includes(name)) {
                toast.error(t('template.exists'));
                return;
                }
                try {
                await updateAgent({ templates: [...(agent.templates || []), name] });
                toast.success(t('template.added', { template: name }));
                } catch (err) {
                console.error(err);
                toast.error(t('template.addError'));
                }
            }}
            />
        </div>

        {/* File Upload for RAG */}
        <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {t('file.uploadLabel')}
            </label>

            {agent.file ? (
            <div className="flex items-center gap-4">
                <a
                href={agent.file}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--brand-blue)] dark:text-[var(--brand-blue)]/80 underline"
                >
                {t('file.currentFile')}
                </a>
                <button
                onClick={handleDeleteFileAndChunks}
                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                <Trash2 size={16} />
                {t('file.delete')}
                </button>
            </div>
            ) : (
            <>
                <input
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 dark:text-gray-300 mb-2"
                />
                {selectedFile && (
                <div className="flex gap-2">
                    <button
                    onClick={handleSaveFile}
                    disabled={savingFile}
                    className="flex items-center gap-1 px-4 py-2 bg-[var(--brand-blue)] text-white rounded hover:opacity-90 transition"
                    >
                    <Save size={16} />
                    {savingFile ? t('file.saving') : t('file.saveAndGenerate')}
                    </button>
                    <button
                    onClick={() => setSelectedFile(null)}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                    >
                    <X size={16} />
                    {t('file.cancel')}
                    </button>
                </div>
                )}
            </>
            )}
        </div>
        </SettingsSection>
        </div>
    );
}
