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
        mediaUrl: "",
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

        if (template.type !== "TEXT" && !template.mediaUrl.trim()) {
            toast.error("Media URL is required for media templates");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/whatsapp/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(template),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create template");

            toast.success("Template created successfully");
            setTemplate({
                name: "",
                type: "TEXT",
                content: "",
                caption: "",
                mediaUrl: "",
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

    // 🧷 Upload media (optional: integrate cloud upload or local preview)
    // const handleMediaUpload = async (file: File) => {
    //     // You can later replace this with Cloudinary, S3, or Firebase upload
    //     const mockUrl = URL.createObjectURL(file);
    //     setTemplate({ ...template, mediaUrl: mockUrl });
    //     setMediaFiles([file]);
    // };

    return (
        <div className="space-y-4 bg-gray-800 p-4 rounded shadow-md">
            {/* Name + Type selector + Variable + Media */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <input
                    type="text"
                    placeholder="Template Name"
                    className="flex-1 p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                            mediaUrl: "",
                        })
                    }
                    className="p-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500"
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
                    <MediaButton files={mediaFiles} setFiles={setMediaFiles}/>
                </div>
            </div>

            {/* Content or Media URL */}
            {template.type === "TEXT" ? (
                <textarea
                    placeholder="Template Content (use variables like {{fullName}})"
                    className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition"
                    rows={4}
                    value={template.content}
                    onChange={(e) => setTemplate({ ...template, content: e.target.value })}
                />
            ) : (
                <div>
                    <input
                        type="text"
                        placeholder="Media URL"
                        className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={template.mediaUrl}
                        onChange={(e) => setTemplate({ ...template, mediaUrl: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Optional caption"
                        className="mt-2 w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
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
