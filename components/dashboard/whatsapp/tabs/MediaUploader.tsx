"use client";

import { useState, useRef, useEffect } from "react";

interface MediaUploaderProps {
    type: "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO";
    mediaFile: File | null;
    uploadedUrl: string | null;
    onSelect: (file: File) => void;
    onClear: () => Promise<void> | void;
}

// Convert audio blob to MP3 using @breezystack/lamejs
async function convertToMp3(audioBlob: Blob): Promise<Blob> {
    // Dynamically import lamejs
    const { Mp3Encoder } = await import("@breezystack/lamejs");
    
    // Decode audio using Web Audio API
    const audioContext = new AudioContext();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Get audio data
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const samples = audioBuffer.length;
    
    // Get channel data
    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = numChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;
    
    // Convert Float32Array to Int16Array
    const leftSamples = new Int16Array(samples);
    const rightSamples = new Int16Array(samples);
    
    for (let i = 0; i < samples; i++) {
        // Clamp and convert to 16-bit
        leftSamples[i] = Math.max(-32768, Math.min(32767, Math.floor(leftChannel[i] * 32767)));
        rightSamples[i] = Math.max(-32768, Math.min(32767, Math.floor(rightChannel[i] * 32767)));
    }
    
    // Create MP3 encoder (128kbps)
    const mp3Encoder = new Mp3Encoder(numChannels > 1 ? 2 : 1, sampleRate, 128);
    const mp3Data: Int8Array[] = [];
    
    // Encode in chunks
    const chunkSize = 1152;
    for (let i = 0; i < samples; i += chunkSize) {
        const leftChunk = leftSamples.subarray(i, Math.min(i + chunkSize, samples));
        const rightChunk = rightSamples.subarray(i, Math.min(i + chunkSize, samples));
        
        let mp3buf: Int8Array;
        if (numChannels > 1) {
            mp3buf = mp3Encoder.encodeBuffer(leftChunk, rightChunk);
        } else {
            mp3buf = mp3Encoder.encodeBuffer(leftChunk);
        }
        
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }
    
    // Flush remaining data
    const mp3End = mp3Encoder.flush();
    if (mp3End.length > 0) {
        mp3Data.push(mp3End);
    }
    
    await audioContext.close();
    
    // Combine all chunks into a single Blob
    return new Blob(mp3Data, { type: "audio/mpeg" });
}

export default function MediaUploader({ type, mediaFile, uploadedUrl, onSelect, onClear }: MediaUploaderProps) {
    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup audio URL on unmount
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [audioUrl]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Use default format - we'll convert to MP3 later
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            
            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Failed to start recording:", err);
            alert("Could not access microphone. Please allow microphone access.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const useRecording = async () => {
        if (!audioBlob) return;
        
        setIsConverting(true);
        try {
            // Convert to MP3 for WhatsApp compatibility
            const mp3Blob = await convertToMp3(audioBlob);
            const file = new File([mp3Blob], `recording_${Date.now()}.mp3`, { type: "audio/mpeg" });
            onSelect(file);
            clearRecording();
        } catch (err) {
            console.error("Failed to convert audio to MP3:", err);
            alert("Failed to convert audio. Please try uploading an MP3 file instead.");
        } finally {
            setIsConverting(false);
        }
    };

    const clearRecording = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="space-y-3">
            {/* File upload input */}
            <input
                type="file"
                accept={
                    type === "IMAGE"
                        ? "image/jpeg,image/jpg,image/png"
                        : type === "VIDEO"
                        ? "video/mp4"
                        : type === "AUDIO"
                        ? "audio/mpeg,audio/mp3"
                        : "application/pdf"
                }
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onSelect(f);
                }}
            />
            
            {type === "AUDIO" && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Supported format: MP3
                </p>
            )}

            {/* Audio Recording UI - only for AUDIO type */}
            {type === "AUDIO" && !mediaFile && (
                <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Or record audio:</p>
                    
                    {!audioBlob ? (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                {!isRecording ? (
                                    <button
                                        type="button"
                                        onClick={startRecording}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <circle cx="10" cy="10" r="6" />
                                        </svg>
                                        Start Recording
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={stopRecording}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <rect x="6" y="6" width="8" height="8" />
                                            </svg>
                                            Stop
                                        </button>
                                        <div className="flex items-center gap-2 text-red-500">
                                            <span className="animate-pulse">●</span>
                                            <span className="font-mono">{formatTime(recordingTime)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Audio preview */}
                            <audio src={audioUrl || undefined} controls className="w-full" />
                            
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={useRecording}
                                    disabled={isConverting}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg transition"
                                >
                                    {isConverting ? "Converting to MP3..." : "Use Recording"}
                                </button>
                                <button
                                    type="button"
                                    onClick={clearRecording}
                                    disabled={isConverting}
                                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg transition"
                                >
                                    Discard
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Selected file display */}
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

            {/* Audio preview for uploaded audio files */}
            {type === "AUDIO" && uploadedUrl && (
                <audio src={uploadedUrl} controls className="w-full mt-2" />
            )}
        </div>
    );
}

