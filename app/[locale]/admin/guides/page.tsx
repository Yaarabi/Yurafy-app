"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus, Edit, Trash2, Loader2, Save, X, BookOpen, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface Guide {
    _id?: string;
    category: string;
    title: string;
    description: string;
    videoUrl: string;
    order: number;
    isActive: boolean;
}

const categories = ["overview", "products", "orders", "automation", "ai-agent"];

export default function AdminGuidesPage() {
    const t = useTranslations("admin.guides");
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

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

    const handleSave = async () => {
        if (!editingGuide) return;

        try {
            setSaving(true);
            const method = editingGuide._id ? "PUT" : "POST";
            const response = await fetch("/api/guides", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingGuide),
            });

            if (!response.ok) throw new Error("Failed to save guide");

            toast.success(t(editingGuide._id ? "success.updated" : "success.created"));
            setIsModalOpen(false);
            setEditingGuide(null);
            fetchGuides();
        } catch (error) {
            console.error("Error saving guide:", error);
            toast.error(t("errors.saveFailed"));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("confirmDelete"))) return;

        try {
            const response = await fetch(`/api/guides?id=${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete guide");

            toast.success(t("success.deleted"));
            fetchGuides();
        } catch (error) {
            console.error("Error deleting guide:", error);
            toast.error(t("errors.deleteFailed"));
        }
    };

    const openCreateModal = () => {
        setEditingGuide({
            category: "overview",
            title: "",
            description: "",
            videoUrl: "",
            order: 0,
            isActive: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (guide: Guide) => {
        setEditingGuide({ ...guide });
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-8 h-8 text-[var(--brand-blue)]" />
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                {t("title")}
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{t("subtitle")}</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3 bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        {t("addNew")}
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[var(--brand-blue)] animate-spin" />
                    </div>
                )}

                {/* Guides Table */}
                {!loading && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                            {t("table.category")}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                            {t("table.title")}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase hidden md:table-cell">
                                            {t("table.videoUrl")}
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                            {t("table.order")}
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                            {t("table.status")}
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                            {t("table.actions")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {guides.map((guide) => (
                                        <tr key={guide._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white capitalize">
                                                {guide.category.replace("-", " ")}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {guide.title}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell max-w-xs truncate">
                                                <a
                                                    href={guide.videoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[var(--brand-blue)] hover:underline"
                                                >
                                                    {guide.videoUrl}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">
                                                {guide.order}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {guide.isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                                                        <Eye className="w-3 h-3" />
                                                        {t("status.active")}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded-full">
                                                        <EyeOff className="w-3 h-3" />
                                                        {t("status.inactive")}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(guide)}
                                                        className="p-2 text-[var(--brand-blue)] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        title={t("edit")}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(guide._id!)}
                                                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title={t("delete")}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {guides.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                                                {t("empty")}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Edit/Create Modal */}
                <AnimatePresence>
                    {isModalOpen && editingGuide && (
                        <div
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        {editingGuide._id ? t("editGuide") : t("createGuide")}
                                    </h2>

                                    <div className="space-y-4">
                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t("form.category")}
                                            </label>
                                            <select
                                                value={editingGuide.category}
                                                onChange={(e) =>
                                                    setEditingGuide({ ...editingGuide, category: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                {categories.map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Title */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t("form.title")}
                                            </label>
                                            <input
                                                type="text"
                                                value={editingGuide.title}
                                                onChange={(e) =>
                                                    setEditingGuide({ ...editingGuide, title: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="Enter guide title"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t("form.description")}
                                            </label>
                                            <textarea
                                                value={editingGuide.description}
                                                onChange={(e) =>
                                                    setEditingGuide({ ...editingGuide, description: e.target.value })
                                                }
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                                placeholder="Enter guide description"
                                            />
                                        </div>

                                        {/* Video URL */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t("form.videoUrl")}
                                            </label>
                                            <input
                                                type="url"
                                                value={editingGuide.videoUrl}
                                                onChange={(e) =>
                                                    setEditingGuide({ ...editingGuide, videoUrl: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="https://www.youtube.com/watch?v=..."
                                            />
                                        </div>

                                        {/* Order & Active */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {t("form.order")}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={editingGuide.order}
                                                    onChange={(e) =>
                                                        setEditingGuide({
                                                            ...editingGuide,
                                                            order: parseInt(e.target.value) || 0,
                                                        })
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {t("form.status")}
                                                </label>
                                                <label className="flex items-center gap-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingGuide.isActive}
                                                        onChange={(e) =>
                                                            setEditingGuide({
                                                                ...editingGuide,
                                                                isActive: e.target.checked,
                                                            })
                                                        }
                                                        className="w-5 h-5 text-[var(--brand-blue)] rounded focus:ring-2 focus:ring-[var(--brand-blue)]"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {t("form.isActive")}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving || !editingGuide.title || !editingGuide.videoUrl}
                                            className="flex-1 px-6 py-3 bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {saving ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Save className="w-5 h-5" />
                                            )}
                                            {saving ? t("saving") : t("save")}
                                        </button>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            disabled={saving}
                                            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <X className="w-5 h-5" />
                                            {t("cancel")}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
