"use client";

interface MediaUploaderProps {
    type: "AUDIO" | "IMAGE" | "VIDEO" | "DOCUMENT";
    mediaFile: File | null;
    uploadedUrl: string | null;
    onSelect: (file: File) => void;
    onClear: () => Promise<void> | void;
}

export default function MediaUploader({ type, mediaFile, uploadedUrl, onSelect, onClear }: MediaUploaderProps) {
    return (
        <div className="space-y-3">
            <input
                type="file"
                accept={
                    type === "AUDIO"
                        ? "audio/*"
                        : type === "IMAGE"
                        ? "image/*"
                        : type === "VIDEO"
                        ? "video/*"
                        : "application/pdf"
                }
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onSelect(f);
                }}
            />

            {mediaFile && uploadedUrl && (
                <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    <span className="truncate">{mediaFile.name}</span>
                    <button
                        onClick={() => void onClear()}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition"
                        title="Remove file"
                        aria-label="Remove file"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}

