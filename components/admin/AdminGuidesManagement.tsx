"use client";

import { useState, useEffect } from "react";
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

export default function AdminGuidesManagement() {
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
            toast.error("Failed to load guides");
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

            toast.success(editingGuide._id ? "Guide updated" : "Guide created");
            setIsModalOpen(false);
            setEditingGuide(null);
            fetchGuides();
        } catch (error) {
            console.error("Error saving guide:", error);
            toast.error("Failed to save guide");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this guide?")) return;

        try {
            const response = await fetch(`/api/guides?id=${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete guide");

            toast.success("Guide deleted");
            fetchGuides();
        } catch (error) {
            console.error("Error deleting guide:", error);
            toast.error("Failed to delete guide");
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                        Guides Management
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage platform guides and video tutorials</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-sm hover:shadow-md whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" />
                    Add Guide
                </button>
            </div>

            {/* Guides Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                    Category
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                    Title
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase hidden md:table-cell">
                                    Video URL
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                    Order
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                    Actions
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
                                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
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
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded-full">
                                                <EyeOff className="w-3 h-3" />
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => openEditModal(guide)}
                                                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(guide._id!)}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Delete"
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
                                        No guides found. Create your first guide!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
                                    {editingGuide._id ? "Edit Guide" : "Create Guide"}
                                </h2>

                                <div className="space-y-4">
                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={editingGuide.category}
                                            onChange={(e) =>
                                                setEditingGuide({ ...editingGuide, category: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={editingGuide.title}
                                            onChange={(e) =>
                                                setEditingGuide({ ...editingGuide, title: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="Enter guide title"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={editingGuide.description}
                                            onChange={(e) =>
                                                setEditingGuide({ ...editingGuide, description: e.target.value })
                                            }
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                            placeholder="Enter guide description"
                                        />
                                    </div>

                                    {/* Video URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Video URL
                                        </label>
                                        <input
                                            type="url"
                                            value={editingGuide.videoUrl}
                                            onChange={(e) =>
                                                setEditingGuide({ ...editingGuide, videoUrl: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                        />
                                    </div>

                                    {/* Order & Active */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Order
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
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Status
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
                                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    Active
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
                                        className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Save className="w-5 h-5" />
                                        )}
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={saving}
                                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <X className="w-5 h-5" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
