"use client";

import { useState, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";
import NameTypeRow from "./NameTypeRow";
import ActiveVariables from "./ActiveVariables";
import MediaUploader from "./MediaUploader";

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

    const [variableSpans, setVariableSpans] = useState<
        Array<{ key: string; seq: number }>
    >([]);

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    /* ----------------------------------------------------
     🔵 File Upload
    ----------------------------------------------------- */
    const handleFileChange = async (file: File) => {
        try {
            // Remove previous upload
            if (uploadedUrl) {
                await fetch("/api/upload", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ urls: [uploadedUrl] }),
                });
            }

            const { uploadFile } = await import("@/lib/utils/upload");
            const result = await uploadFile(file);

            if (!result.success) throw new Error(result.error.message);

            setUploadedUrl(result.data.url);
            setTemplate((t) => ({ ...t, link: result.data.url }));
            setMediaFile(file);
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        }
    };

    /* ----------------------------------------------------
     🔵 Insert Variable
    ----------------------------------------------------- */
    const handleInsertVariable = (varKey: string) => {
        if (variableSpans.some((v) => v.key === varKey)) {
            return toast.error("This variable is already added");
        }

        const seq = variableSpans.length + 1;
        const placeholder = `{{${seq}}}`;

        // Insert into TEXT content
        if (template.type === "TEXT") {
            const textarea = textareaRef.current;
            const cursor = textarea ? textarea.selectionStart : template.content.length;

            const newContent =
                template.content.slice(0, cursor) +
                placeholder +
                template.content.slice(cursor);

            setTemplate((t) => ({
                ...t,
                content: newContent,
                variables: [...t.variables, varKey],
            }));

            requestAnimationFrame(() => textarea?.focus());
        }

        // Insert into MEDIA caption
        else {
            const newCaption = template.caption
                ? `${template.caption} ${placeholder}`
                : placeholder;

            setTemplate((t) => ({
                ...t,
                caption: newCaption,
                variables: [...t.variables, varKey],
            }));
        }

        setVariableSpans((prev) => [...prev, { key: varKey, seq }]);
    };

    /* ----------------------------------------------------
     🔵 Remove Variable
    ----------------------------------------------------- */
    const handleRemoveVar = (seq: number) => {
        const index = variableSpans.findIndex((v) => v.seq === seq);
        if (index === -1) return;

        let newContent = template.content.replace(new RegExp(`{{${seq}}}`, "g"), "");

        // Remove the variable
        const newSpans = variableSpans.filter((v) => v.seq !== seq);
        const newVars = template.variables.filter((_, i) => i !== index);

        // Renumber placeholders
        newSpans.forEach((span, i) => {
            const newSeq = i + 1;
            newContent = newContent.replace(
                new RegExp(`{{${span.seq}}}`, "g"),
                `{{${newSeq}}}`
            );
            span.seq = newSeq;
        });

        setTemplate((t) => ({ ...t, content: newContent, variables: newVars }));
        setVariableSpans(newSpans);
    };

    /* ----------------------------------------------------
     🔵 Sync Variables When User Types
    ----------------------------------------------------- */
    const handleContentChange = (val: string) => {
        const matches = Array.from(val.matchAll(/{{(\d+)}}/g)).map((m) => Number(m[1]));

        const newSpans = variableSpans.filter((s) => matches.includes(s.seq));
        const newVars = newSpans.map((s) => {
            const index = variableSpans.findIndex((v) => v.seq === s.seq);
            return template.variables[index];
        });

        setTemplate((t) => ({ ...t, content: val, variables: newVars }));
        setVariableSpans(newSpans);
    };

    /* ----------------------------------------------------
     🔵 RTL Detection
    ----------------------------------------------------- */
    const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);
    const contentDir = useMemo(
        () => (isArabic(template.content) ? "rtl" : "ltr"),
        [template.content]
    );
    const captionDir = useMemo(
        () => (isArabic(template.caption) ? "rtl" : "ltr"),
        [template.caption]
    );

    /* ----------------------------------------------------
     🔵 Submit Template
    ----------------------------------------------------- */
    const handleCreate = async () => {
        if (!template.name.trim()) return toast.error("Template name required");
        if (template.type === "TEXT" && !template.content.trim())
            return toast.error("Content required");
        if (template.type !== "TEXT" && !uploadedUrl)
            return toast.error("Upload media first");

        setLoading(true);

        try {
            const res = await fetch("/api/whatsapp/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(template),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success("Template created");

            // Reset UI
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

            onSuccess?.();
            onClose?.();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    /* ----------------------------------------------------
     🔵 UI Layout
    ----------------------------------------------------- */
    return (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[520px] overflow-x-hidden">
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded shadow-md border border-gray-200 dark:border-gray-700 max-h-[85vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 pb-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Add WhatsApp Template
                    </h3>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                            aria-label="Close"
                            title="Close"
                        >
                            <FaTimes className="text-lg" />
                        </button>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 space-y-5 py-4">

                {/* Name + Type + Variable Button */}
                <NameTypeRow
                    name={template.name}
                    type={template.type}
                    onNameChange={(v) => setTemplate({ ...template, name: v })}
                    onTypeChange={(v) =>
                        setTemplate({
                            ...template,
                            type: v as any,
                            content: "",
                            caption: "",
                            link: "",
                        })
                    }
                    onInsertVariable={handleInsertVariable}
                />

                {/* Active Variables */}
                <ActiveVariables
                    variableSpans={variableSpans}
                    onRemove={handleRemoveVar}
                />

                {/* TEXT TEMPLATE */}
                {template.type === "TEXT" ? (
                    <div className="p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                        <textarea
                            ref={textareaRef}
                            placeholder="Write your message…"
                            className={`w-full bg-transparent resize-none outline-none text-gray-900 dark:text-white ${
                                contentDir === "rtl" ? "text-right" : "text-left"
                            }`}
                            dir={contentDir}
                            rows={4}
                            value={template.content}
                            onChange={(e) => handleContentChange(e.target.value)}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <MediaUploader
                            type={template.type}
                            mediaFile={mediaFile}
                            uploadedUrl={uploadedUrl}
                            onSelect={(file) => void handleFileChange(file)}
                            onClear={async () => {
                                if (uploadedUrl) {
                                    await fetch("/api/upload", {
                                        method: "DELETE",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ urls: [uploadedUrl] }),
                                    });
                                }
                                setMediaFile(null);
                                setUploadedUrl(null);
                                setTemplate((t) => ({ ...t, link: "" }));
                            }}
                        />

                        <textarea
                            placeholder="Optional caption"
                            className={`w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white ${
                                captionDir === "rtl" ? "text-right" : "text-left"
                            }`}
                            dir={captionDir}
                            rows={2}
                            value={template.caption}
                            onChange={(e) =>
                                setTemplate({ ...template, caption: e.target.value })
                            }
                        />
                    </div>
                )}

                </div>

                {/* Submit - Fixed at bottom */}
                <div className="p-4 pt-2">
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-2 rounded transition"
                    >
                        {loading ? "Saving…" : "Add Template"}
                    </button>
                </div>
            </div>
        </div>
    );
}
