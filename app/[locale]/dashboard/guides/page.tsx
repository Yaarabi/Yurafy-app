"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { PlayCircle, Loader2, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface Guide {
    _id: string;
    category: string;
    title: string;
    description: string;
    videoUrl: string;
    order: number;
}

const categoryIcons: Record<string, string> = {
    overview: "🎯",
    products: "📦",
    orders: "🛒",
    automation: "⚡",
    "ai-agent": "🤖",
};

export default function GuidesPage() {
    const t = useTranslations("guides");
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedVideo, setSelectedVideo] = useState<Guide | null>(null);

    useEffect(() => {
        fetchGuides();
    }, []);

    const fetchGuides = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/guides");
            if (!response.ok) throw new Error("Failed to fetch guides");

            const data = await response.json();
            setGuides(data.guides || []);
        } catch (error) {
            console.error("Error fetching guides:", error);
            toast.error(t("errors.loadFailed"));
        } finally {
            setLoading(false);
        }
    };

    const categories = ["all", ...new Set(guides.map((g) => g.category))];

    const filteredGuides =
        selectedCategory === "all"
            ? guides
            : guides.filter((g) => g.category === selectedCategory);

    const extractYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-8 h-8 text-[var(--brand-blue)]" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            {t("title")}
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                        {t("subtitle")}
                    </p>
                </div>

                {/* Category Filter */}
                <div className="mb-6 overflow-x-auto pb-2">
                    <div className="flex gap-2 min-w-max sm:min-w-0">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                                    selectedCategory === category
                                        ? "bg-[var(--brand-blue)] text-white shadow-lg"
                                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                                }`}
                            >
                                <span className="mr-2">
                                    {category === "all" ? "📚" : categoryIcons[category] || "📄"}
                                </span>
                                {t(`categories.${category}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[var(--brand-blue)] animate-spin" />
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredGuides.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">{t("empty")}</p>
                    </motion.div>
                )}

                {/* Guides Grid */}
                {!loading && filteredGuides.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredGuides.map((guide, index) => (
                            <motion.div
                                key={guide._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group"
                            >
                                {/* Thumbnail */}
                                <div
                                    className="relative h-48 bg-gray-200 dark:bg-gray-700 cursor-pointer overflow-hidden"
                                    onClick={() => setSelectedVideo(guide)}
                                >
                                    {extractYouTubeId(guide.videoUrl) ? (
                                        <img
                                            src={`https://img.youtube.com/vi/${extractYouTubeId(
                                                guide.videoUrl
                                            )}/maxresdefault.jpg`}
                                            alt={guide.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <PlayCircle className="w-16 h-16 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                        <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                    </div>
                                    <div className="absolute top-2 left-2">
                                        <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-md">
                                            {categoryIcons[guide.category]} {t(`categories.${guide.category}`)}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 sm:p-5">
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                                        {guide.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                        {guide.description}
                                    </p>
                                    <button
                                        onClick={() => setSelectedVideo(guide)}
                                        className="mt-4 w-full px-4 py-2 bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                                    >
                                        <PlayCircle className="w-5 h-5" />
                                        {t("watchNow")}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Video Modal */}
                {selectedVideo && (
                    <div
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedVideo(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="aspect-video">
                                {extractYouTubeId(selectedVideo.videoUrl) ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${extractYouTubeId(
                                            selectedVideo.videoUrl
                                        )}?autoplay=1`}
                                        title={selectedVideo.title}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {t("errors.invalidVideo")}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 sm:p-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {selectedVideo.title}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {selectedVideo.description}
                                </p>
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="mt-4 px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-all"
                                >
                                    {t("close")}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
