"use client";

import { useEffect, useState } from "react";

export default function ServicesVideo() {
    const [guide, setGuide] = useState<{ title: string; description: string; videoUrl: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGuide = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch('/api/guides/public?category=services', { cache: 'no-store' });
                if (!res.ok) throw new Error('Failed to load services guide');
                const data = await res.json();
                const first = Array.isArray(data.guides) && data.guides.length > 0 ? data.guides[0] : null;
                if (first) setGuide({ title: first.title, description: first.description, videoUrl: first.videoUrl });
                else setGuide(null);
            } catch (e: any) {
                setError(e?.message || 'Error loading services guide');
                setGuide(null);
            } finally {
                setLoading(false);
            }
        };
        fetchGuide();
    }, []);

    if (loading || error || !guide?.videoUrl) return null;
    const embed = toYouTubeEmbedUrl(guide.videoUrl);

    return (
        <section id="video" className="max-w-5xl mx-auto px-4 pt-6 scroll-mt-20">
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="aspect-video">
                    <iframe
                        src={embed}
                        title={guide.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        </section>
    );
}

function extractYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
}

function toYouTubeEmbedUrl(url: string) {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : url;
}
