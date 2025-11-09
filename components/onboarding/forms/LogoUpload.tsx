"use client";

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface LogoUploadProps {
    value?: string;
    onChange: (url: string | undefined) => void;
    primaryColor?: string;
    maxSizeMB?: number;
}

export default function LogoUpload({ 
    value, 
    onChange,
    primaryColor = '#3B82F6',
    maxSizeMB = 5
}: LogoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setError(`Please upload a valid image file (JPEG, PNG, WebP, or GIF)`);
            return;
        }

        // Validate file size
        const MAX_SIZE = maxSizeMB * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            setError(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const { uploadFile } = await import('@/lib/utils/upload');
            const result = await uploadFile(file);

            if (!result.success) {
                throw new Error(result.error.message);
            }

            onChange(result.data.url);
            setError(null);
        } catch (error: any) {
            console.error('Error uploading logo:', error);
            setError(error.message || 'Failed to upload logo. Please try again.');
            onChange(undefined);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = () => {
        onChange(undefined);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Logo <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <div className="space-y-3">
                {value ? (
                    <div className="relative inline-block">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                            <img
                                src={value}
                                alt="Logo preview"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 active:scale-95 transition-all touch-manipulation shadow-lg"
                            title="Remove logo"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={triggerFileSelect}
                        className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-10 cursor-pointer hover:border-gray-400 active:scale-[0.98] transition-all bg-gray-50 touch-manipulation"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploading}
                        />
                        <div className="flex flex-col items-center justify-center text-center">
                            {uploading ? (
                                <>
                                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" />
                                    <p className="text-sm text-gray-600">Uploading...</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                        Click to upload logo
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        JPEG, PNG, WebP, or GIF (max {maxSizeMB}MB)
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
            </div>
        </div>
    );
}

