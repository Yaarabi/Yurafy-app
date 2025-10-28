'use client';
import TemplateSelector from "../automation/TemplateSelector";
import SettingsSection from "@/components/dashboard/setting/settingSection";
import { IAIAgent } from "@/models/ai-agent";
import { ITemplate } from "@/models/templates";
import toast from "react-hot-toast";
import { useState } from "react";
import { Trash2, Save, X } from "lucide-react";

interface ToolsTabProps {
    agent: IAIAgent;
    availableTemplates: ITemplate[];
    updateAgent: (payload: any) => Promise<void>;
}

export default function ToolsTab({ agent, availableTemplates, updateAgent }: ToolsTabProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [savingFile, setSavingFile] = useState(false);

    // Save file & generate embeddings
    const handleSaveFile = async () => {
        if (!selectedFile) return;
        setSavingFile(true);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
        // 1. Upload file
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Upload failed");
        const data = await uploadRes.json();
        const fileUrl = data.url;

        // 2. Update agent
        await updateAgent({ file: fileUrl });
        toast.success("File saved to agent");

        // 3. Generate embeddings
        const embedRes = await fetch("/api/ai-agent/embed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agentId: agent._id }),
        });
        if (!embedRes.ok) throw new Error("Embedding failed");
        toast.success("Embeddings generated successfully");

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
        toast.success("File and embeddings deleted");
        } catch (err) {
        console.error(err);
        toast.error("Delete failed");
        }
    };

    return (
        <SettingsSection title="AI Agent Configuration">
        {/* Existing templates */}
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Existing Templates
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
                        toast.success(`Template "${tpl}" deleted`);
                        } catch (err) {
                        console.error(err);
                        toast.error("Failed to delete template");
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
            <p className="text-gray-500 dark:text-gray-300">No templates yet.</p>
            )}

            <TemplateSelector
            label="Add Another Template"
            templates={availableTemplates}
            selected=""
            onChange={async (name) => {
                if (!name) return;
                if (agent.templates?.includes(name)) {
                toast.error("Template already exists");
                return;
                }
                try {
                await updateAgent({ templates: [...(agent.templates || []), name] });
                toast.success(`Template "${name}" added`);
                } catch (err) {
                console.error(err);
                toast.error("Failed to add template");
                }
            }}
            />
        </div>

        {/* File Upload for RAG */}
        <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            File Upload (for RAG)
            </label>

            {agent.file ? (
            <div className="flex items-center gap-4">
                <a
                href={agent.file}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline"
                >
                Current File
                </a>
                <button
                onClick={handleDeleteFileAndChunks}
                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                <Trash2 size={16} />
                Delete
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
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                    <Save size={16} />
                    {savingFile ? "Saving..." : "Save File & Generate Embeddings"}
                    </button>
                    <button
                    onClick={() => setSelectedFile(null)}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                    >
                    <X size={16} />
                    Cancel
                    </button>
                </div>
                )}
            </>
            )}
        </div>
        </SettingsSection>
    );
}
