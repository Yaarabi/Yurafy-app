"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import VariableDropdown from "./TemplateEditor";

interface AddTemplateProps {
    onSuccess?: () => void;
    onClose?: () => void;
}

export default function AddTemplate({ onSuccess, onClose }: AddTemplateProps) {
    const [loading, setLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

    const [template, setTemplate] = useState({
        name: "",
        type: "TEXT" as "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT",
        content: "",
        caption: "",
        link: "",
        variables: [] as string[],
    });

    // 🧠 Upload file and delete previous if needed
    const handleFileChange = async (file: File) => {
        try {
        if (uploadedUrl) {
            await fetch("/api/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls: [uploadedUrl] }),
            });
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Upload failed");

        setUploadedUrl(data.url);
        setTemplate((prev) => ({ ...prev, link: data.url }));
        setMediaFile(file);
        } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Upload failed");
        }
    };

    // 🧠 Create Template
    const handleCreate = async () => {
        if (!template.name.trim()) {
        toast.error("Template name is required");
        return;
        }

        if (template.type === "TEXT" && !template.content.trim()) {
        toast.error("Content is required for text templates");
        return;
        }

        if (template.type !== "TEXT" && !uploadedUrl && !template.link.trim()) {
        toast.error("Please upload a file or provide a media URL");
        return;
        }

        setLoading(true);
        try {
        const res = await fetch("/api/whatsapp/templates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...template }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create template");

        toast.success("Template created successfully");

        setTemplate({
            name: "",
            type: "TEXT",
            content: "",
            caption: "",
            link: "",
            variables: [],
        });
        setMediaFile(null);
        setUploadedUrl(null);
        
        // Trigger refresh and close modal
        if (onSuccess) onSuccess();
        if (onClose) onClose();
        } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Save failed");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded shadow-md border border-gray-200 dark:border-gray-700">
        {/* Name + Type + Variables */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <input
            type="text"
            placeholder="Template Name"
            className="flex-1 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition border border-gray-200 dark:border-gray-600"
            value={template.name}
            onChange={(e) => setTemplate({ ...template, name: e.target.value })}
            />

            <select
            value={template.type}
            onChange={(e) =>
                setTemplate({
                ...template,
                type: e.target.value as any,
                content: "",
                caption: "",
                link: "",
                })
            }
            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500 border border-gray-200 dark:border-gray-600"
            >
            <option value="TEXT">Text</option>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
            <option value="AUDIO">Audio</option>
            <option value="DOCUMENT">Document</option>
            </select>

            <div className="flex gap-2 mt-2 sm:mt-0">
            <VariableDropdown
                onSelect={(v) =>
                setTemplate({
                    ...template,
                    content: template.content + v,
                    variables: [...new Set([...template.variables, v])],
                })
                }
            />
            </div>
        </div>

        {/* Content or Media */}
        {template.type === "TEXT" ? (
            <textarea
            placeholder="Template Content (use variables like {{fullName}})"
            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition border border-gray-200 dark:border-gray-600"
            rows={4}
            value={template.content}
            onChange={(e) => setTemplate({ ...template, content: e.target.value })}
            />
        ) : (
            <div className="space-y-3">
            {/* File input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload Media
                </label>
                <input
                type="file"
                accept="image/*,audio/*,video/*,application/pdf"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(file);
                }}
                className="block w-full text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[var(--brand-blue)] file:text-white hover:file:bg-[var(--brand-blue)]/90 transition"
                />
            </div>

            {/* Uploaded file preview */}
            {mediaFile && uploadedUrl && (
                <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 rounded px-3 py-2 text-sm text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                <span className="truncate">{mediaFile.name}</span>
                <button
                    type="button"
                    onClick={async () => {
                    await fetch("/api/upload", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ urls: [uploadedUrl] }),
                    });
                    setMediaFile(null);
                    setUploadedUrl(null);
                    setTemplate((prev) => ({ ...prev, link: "" }));
                    }}
                    className="text-red-500 hover:text-red-400 ml-2 transition"
                    title="Remove"
                >
                    ✕
                </button>
                </div>
            )}

            {/* Optional caption */}
            <input
                type="text"
                placeholder="Optional caption"
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition border border-gray-200 dark:border-gray-600"
                value={template.caption}
                onChange={(e) => setTemplate({ ...template, caption: e.target.value })}
            />
            </div>
        )}

        {/* Submit */}
        <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-medium transition"
        >
            {loading ? "Saving..." : "Add Template"}
        </button>
        </div>
    );
}
