"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import VariableDropdown from "./TemplateEditor";
import MediaButton from "./MediaUploader";

export default function AddTemplate() {
    const [loading, setLoading] = useState(false);
    const [template, setTemplate] = useState({ name: "", content: "" });
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);

    const handleCreate = async () => {
        if (!template.name.trim() || !template.content.trim()) {
        toast.error("Name and content required");
        return;
        }
        setLoading(true);

        try {
        const formData = new FormData();
        formData.append("name", template.name);
        formData.append("content", template.content);
        mediaFiles.forEach((file) => formData.append("media", file));

        const res = await fetch("/api/whatsapp/templates", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create template");

        toast.success("Template created");
        setTemplate({ name: "", content: "" });
        setMediaFiles([]);
        } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Save failed");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="space-y-4 bg-gray-800 p-4 rounded shadow-md">
        {/* Inline header: Name + Variable + Media */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <input
            type="text"
            placeholder="Template Name"
            className="flex-1 p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={template.name}
            onChange={(e) => setTemplate({ ...template, name: e.target.value })}
            />

            <div className="flex gap-2 mt-2 sm:mt-0">
            <VariableDropdown
                onSelect={(v) =>
                setTemplate({ ...template, content: template.content + v })
                }
            />
            <MediaButton files={mediaFiles} setFiles={setMediaFiles} />
            </div>
        </div>

        {/* Content textarea */}
        <textarea
            placeholder="Template Content (use variables)"
            className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition"
            rows={4}
            value={template.content}
            onChange={(e) => setTemplate({ ...template, content: e.target.value })}
        />

        {/* Submit button */}
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
