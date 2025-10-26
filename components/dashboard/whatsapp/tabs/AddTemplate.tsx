"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import VariableDropdown from "./TemplateEditor";
import MediaButton from "./MediaUploader";

export default function AddTemplate() {
    const [loading, setLoading] = useState(false);

    const [template, setTemplate] = useState({
        name: "",
        type: "TEXT" as "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT",
        content: "",
        caption: "",
        link: "",
        variables: [] as string[],
    });

    const [mediaFiles, setMediaFiles] = useState<File[]>([]);

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

        if (template.type !== "TEXT" && mediaFiles.length === 0 && !template.link.trim()) {
        toast.error("Please upload a file or provide a media URL");
        return;
        }

        setLoading(true);
        try {
        let link = template.link;

        // If user uploaded a file, send it to /api/upload
        if (template.type !== "TEXT" && mediaFiles.length > 0) {
            const formData = new FormData();
            formData.append("file", mediaFiles[0]);

            const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
            });

            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.message || "Upload failed");

            link = uploadData.url;
        }

        // Now create the template with the uploaded media URL
        const res = await fetch("/api/whatsapp/templates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...template, link }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create template");

        toast.success("Template created successfully");

        // Reset state
        setTemplate({
            name: "",
            type: "TEXT",
            content: "",
            caption: "",
            link: "",
            variables: [],
        });
        setMediaFiles([]);
        } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Save failed");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded shadow-md border border-gray-200 dark:border-gray-700">
        {/* Name + Type selector + Variable + Media */}
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
            <MediaButton files={mediaFiles} setFiles={setMediaFiles} />
            </div>
        </div>

        {/* Content or Media URL */}
        {template.type === "TEXT" ? (
            <textarea
            placeholder="Template Content (use variables like {{fullName}})"
            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition border border-gray-200 dark:border-gray-600"
            rows={4}
            value={template.content}
            onChange={(e) => setTemplate({ ...template, content: e.target.value })}
            />
        ) : (
            <div>
            <input
                type="text"
                placeholder="Media URL (optional if uploading a file)"
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition border border-gray-200 dark:border-gray-600"
                value={template.link}
                onChange={(e) => setTemplate({ ...template, link: e.target.value })}
            />
            <input
                type="text"
                placeholder="Optional caption"
                className="mt-2 w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition border border-gray-200 dark:border-gray-600"
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
