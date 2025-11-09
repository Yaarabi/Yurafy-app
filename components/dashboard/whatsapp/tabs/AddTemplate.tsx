"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import VariableDropdown from "./TemplateEditor";
import { Mic, Square, Play, Pause } from "lucide-react";

interface AddTemplateProps {
    onSuccess?: () => void;
    onClose?: () => void;
}

export default function AddTemplate({ onSuccess, onClose }: AddTemplateProps) {
    const [loading, setLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

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

        const { uploadFile } = await import('@/lib/utils/upload');
        const result = await uploadFile(file);

        if (!result.success) {
            throw new Error(result.error.message || "Upload failed");
        }

        setUploadedUrl(result.data.url);
        setTemplate((prev) => ({ ...prev, link: result.data.url }));
        setMediaFile(file);
        } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Upload failed");
        }
    };

    // 🎤 Audio Recording Functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audioBlob);
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                
                // Convert to File and upload
                const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
                await handleFileChange(audioFile);
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            toast.success("Recording started");
        } catch (err: any) {
            console.error("Error starting recording:", err);
            toast.error("Failed to start recording. Please check microphone permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            toast.success("Recording stopped");
        }
    };

    const playRecording = () => {
        if (audioUrl && audioPlayerRef.current) {
            if (isPlaying) {
                audioPlayerRef.current.pause();
                setIsPlaying(false);
            } else {
                audioPlayerRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const deleteRecording = async () => {
        if (uploadedUrl) {
            try {
                await fetch("/api/upload", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ urls: [uploadedUrl] }),
                });
            } catch (err) {
                console.error("Error deleting recording:", err);
            }
        }
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(null);
        setAudioUrl(null);
        setMediaFile(null);
        setUploadedUrl(null);
        setTemplate((prev) => ({ ...prev, link: "" }));
        setIsPlaying(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
            }
        };
    }, [audioUrl, isRecording]);

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

        if (template.type !== "TEXT" && !uploadedUrl && !template.link.trim() && !audioBlob) {
        toast.error("Please record audio, upload a file, or provide a media URL");
        return;
        }

        // If we have a recorded audio blob but no uploaded URL, upload it first
        if (template.type === "AUDIO" && audioBlob && !uploadedUrl) {
            try {
                const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append("file", audioFile);
                
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });
                
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) throw new Error(uploadData.message || "Upload failed");
                
                setUploadedUrl(uploadData.url);
                setTemplate((prev) => ({ ...prev, link: uploadData.url }));
            } catch (err: any) {
                toast.error(err.message || "Failed to upload recording");
                return;
            }
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
            className="flex-1 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[var(--brand-blue)] outline-none transition border border-gray-200 dark:border-gray-600"
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
            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-[var(--brand-blue)] border border-gray-200 dark:border-gray-600"
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
            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-[var(--brand-blue)] outline-none transition border border-gray-200 dark:border-gray-600"
            rows={4}
            value={template.content}
            onChange={(e) => setTemplate({ ...template, content: e.target.value })}
            />
        ) : (
            <div className="space-y-3">
            {/* Audio Recording Option (only for AUDIO type) */}
            {template.type === "AUDIO" && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Record Audio
                    </label>
                    <div className="flex gap-2 items-center">
                        {!isRecording && !audioUrl && (
                            <button
                                type="button"
                                onClick={startRecording}
                                className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-blue)] hover:opacity-90 text-white rounded-lg font-medium transition"
                            >
                                <Mic className="w-4 h-4" />
                                Start Recording
                            </button>
                        )}
                        {isRecording && (
                            <button
                                type="button"
                                onClick={stopRecording}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                            >
                                <Square className="w-4 h-4" />
                                Stop Recording
                            </button>
                        )}
                        {audioUrl && (
                            <>
                                <button
                                    type="button"
                                    onClick={playRecording}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                                >
                                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    {isPlaying ? "Pause" : "Play"}
                                </button>
                                <button
                                    type="button"
                                    onClick={deleteRecording}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                    {isRecording && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                            Recording...
                        </div>
                    )}
                    {audioUrl && (
                        <audio
                            ref={audioPlayerRef}
                            src={audioUrl}
                            onEnded={() => setIsPlaying(false)}
                            className="hidden"
                        />
                    )}
                    {audioUrl && !uploadedUrl && (
                        <p className="text-xs text-gray-500">Recording saved. Click "Add Template" to upload.</p>
                    )}
                </div>
            )}

            {/* File input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {template.type === "AUDIO" ? "Or Upload Audio File" : "Upload Media"}
                </label>
                <input
                type="file"
                accept={template.type === "AUDIO" ? "audio/*" : template.type === "IMAGE" ? "image/*" : template.type === "VIDEO" ? "video/*" : "application/pdf"}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        // Clear recording if uploading file
                        if (audioUrl) {
                            URL.revokeObjectURL(audioUrl);
                            setAudioUrl(null);
                            setAudioBlob(null);
                        }
                        handleFileChange(file);
                    }
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
                    if (audioUrl) {
                        URL.revokeObjectURL(audioUrl);
                        setAudioUrl(null);
                        setAudioBlob(null);
                    }
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
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[var(--brand-blue)] outline-none transition border border-gray-200 dark:border-gray-600"
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
