import { useState, useRef } from 'react';

interface UseLogoUploadOptions {
    maxSizeMB?: number;
    allowedTypes?: string[];
}

export function useLogoUpload(options: UseLogoUploadOptions = {}) {
    const { 
        maxSizeMB = 5, 
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'] 
    } = options;
    
    const [logo, setLogo] = useState<string>('');
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadLogo = async (file: File): Promise<string | null> => {
        // Validate file type
        if (!allowedTypes.includes(file.type)) {
            const errorMessage = `Please upload a valid image file (${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')})`;
            setError(errorMessage);
            return null;
        }

        // Validate file size
        const MAX_SIZE = maxSizeMB * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            const errorMessage = `File size must be less than ${maxSizeMB}MB`;
            setError(errorMessage);
            return null;
        }

        setUploading(true);
        setError(null);

        try {
            const { uploadFile } = await import('@/lib/utils/upload');
            const result = await uploadFile(file);

            if (!result.success) {
                throw new Error(result.error.message);
            }

            setLogo(result.data.url);
            setLogoPreview(result.data.url);
            setError(null);
            return result.data.url;
        } catch (error: any) {
            console.error('Error uploading logo:', error);
            const errorMessage = error.message || 'Failed to upload logo. Please try again.';
            setError(errorMessage);
            setLogo('');
            setLogoPreview('');
            return null;
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadLogo(file);
    };

    const removeLogo = () => {
        setLogo('');
        setLogoPreview('');
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return {
        logo,
        logoPreview,
        uploading,
        error,
        fileInputRef,
        uploadLogo,
        handleFileSelect,
        removeLogo,
        triggerFileSelect,
    };
}

