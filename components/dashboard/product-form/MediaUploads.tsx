'use client';

import { ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { IProduct } from '@/models/products';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function isValidFileType(file: File) {
    const allowedTypes = ['image/', 'video/', 'audio/'];
    return allowedTypes.some((type) => file.type.startsWith(type));
}

interface MediaUploadsProps {
    values: Partial<IProduct>;
    setValues: React.Dispatch<React.SetStateAction<Partial<IProduct>>>;
}

export default function MediaUploads({ values, setValues }: MediaUploadsProps) {
    const t = useTranslations('products.form');

    const handleImageUpload = async (
        e: ChangeEvent<HTMLInputElement>,
        field: 'mainImage' | 'images' | 'descriptionsImage'
    ) => {
        const files = e.target.files;
        if (!files) return;

        const uploadedUrls: string[] = [];

        for (const file of Array.from(files)) {
            if (!isValidFileType(file)) {
                toast.error('Unsupported file type. Only images, videos, and audio files are allowed.');
                continue;
            }

            if (file.size > MAX_FILE_SIZE) {
                toast.error('File too large. Maximum size is 10MB.');
                continue;
            }

            const { uploadFile } = await import('@/lib/utils/upload');
            const result = await uploadFile(file);

            if (result.success) {
                uploadedUrls.push(result.data.url);
            } else {
                console.error('Upload failed:', result.error.message);
                toast.error(result.error.message || 'Failed to upload file');
            }
        }

        setValues((prev) => ({
            ...prev,
            [field]:
                field === 'mainImage'
                ? uploadedUrls[0]
                : field === 'descriptionsImage'
                ? [...(prev.descriptionsImage || []), ...uploadedUrls]
                : [...(prev.images || []), ...uploadedUrls],
        }));
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Main Image */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">{t('mainImage')}</label>
                    <input
                        type="file"
                        accept="image/*,video/*,audio/*"
                        onChange={(e) => handleImageUpload(e, 'mainImage')}
                        className="file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:opacity-90 cursor-pointer text-gray-800 dark:text-gray-200"
                    />
                    {values.mainImage && (
                        <img src={values.mainImage} alt="Main Preview" className="mt-2 w-full h-60 object-cover rounded-lg border border-gray-700" />
                    )}
                </div>

                {/* Additional Media */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">{t('otherImages')}</label>
                    <input
                        type="file"
                        accept="image/*,video/*,audio/*"
                        multiple
                        onChange={(e) => handleImageUpload(e, 'images')}
                        className="file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:opacity-90 cursor-pointer text-gray-800 dark:text-gray-200"
                    />
                    <div className="flex flex-wrap gap-3 mt-2">
                        {values.images?.map((url, idx) => {
                            const ext = url.split('.').pop()?.toLowerCase();
                            if (ext?.match(/(jpg|jpeg|png|webp|gif)/)) {
                                return (
                                    <div key={idx} className="relative">
                                        <img
                                            src={url}
                                            alt={`Preview ${idx + 1}`}
                                            className="w-28 h-28 object-cover rounded-lg border border-gray-700"
                                        />
                                    </div>
                                );
                            } else if (ext?.match(/(mp4|webm|ogg)/)) {
                                return (
                                    <video
                                        key={idx}
                                        src={url}
                                        controls
                                        className="w-28 h-28 rounded-lg border border-gray-700"
                                    />
                                );
                            } else if (ext?.match(/(mp3|wav|ogg)/)) {
                                return (
                                    <audio
                                        key={idx}
                                        src={url}
                                        controls
                                        className="w-28 mt-2"
                                    />
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            </div>

            {/* Description Images Section */}
            <div className="mt-4">
                <label className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-2 block">
                    {t('descriptionImages')}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {t('descriptionImagesHelp')}
                </p>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, 'descriptionsImage')}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                {values.descriptionsImage && values.descriptionsImage.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {values.descriptionsImage.map((url, idx) => (
                            <div key={idx} className="relative">
                                <img
                                    src={url}
                                    alt={`${t('descriptionImageAlt')} ${idx + 1}`}
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newImages = values.descriptionsImage?.filter((_, i) => i !== idx) || [];
                                        setValues(prev => ({ ...prev, descriptionsImage: newImages }));
                                    }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
