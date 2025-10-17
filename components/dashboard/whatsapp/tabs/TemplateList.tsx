
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Template {
    _id: string;
    name: string;
    content: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
}

export default function TemplateList() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState({ name: "", content: "" });

    const fetchTemplates = async () => {
        try {
            const res = await fetch("/api/whatsapp/templates");
            if (!res.ok) throw new Error("Failed to fetch templates");
            const data = await res.json();
            setTemplates(Array.isArray(data.templates) ? data.templates : []);
        } catch (err) {
            console.error(err);
            toast.error("Could not load templates");
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleUpdate = async (id: string) => {
        if (!editData.name.trim() || !editData.content.trim()) {
            toast.error("Name and content required");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/whatsapp/templates", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...editData }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update template");

            toast.success("Template updated");
            setEditingId(null);
            setEditData({ name: "", content: "" });
            fetchTemplates();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this template?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/whatsapp/templates?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to delete template");

            toast.success("Template deleted");
            fetchTemplates();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Delete failed");
        } finally {
            setLoading(false);
        }
    };

    const renderStatusBadge = (status: Template["status"], reason?: string) => {
        let color = "bg-gray-500";
        if (status === "APPROVED") color = "bg-green-600";
        if (status === "PENDING") color = "bg-yellow-600";
        if (status === "REJECTED") color = "bg-red-600";
        return (
            <span className={`${color} text-white text-xs px-2 py-1 rounded ml-2`} title={reason || ""}>
                {status}
            </span>
        );
    };

    return (
        <div>
            <h3 className="text-lg font-medium mb-2">Existing Templates</h3>
            <ul className="space-y-2">
                {templates.length === 0 && <li className="text-sm text-gray-400">No templates yet.</li>}
                {templates.map((tpl) => (
                    <li key={tpl._id} className="bg-gray-700 p-3 rounded space-y-2">
                        {editingId === tpl._id ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    className="w-full p-2 rounded bg-gray-600 text-white"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                />
                                <textarea
                                    className="w-full p-2 rounded bg-gray-600 text-white"
                                    rows={3}
                                    value={editData.content}
                                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdate(tpl._id)}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingId(null);
                                            setEditData({ name: "", content: "" });
                                        }}
                                        className="bg-gray-500 hover:bg-gray-400 px-3 py-1 rounded text-white"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold flex items-center">
                                        {tpl.name}
                                        {renderStatusBadge(tpl.status, tpl.rejectionReason)}
                                    </p>
                                    <p className="text-sm text-gray-300">{tpl.content}</p>
                                    {tpl.status === "REJECTED" && tpl.rejectionReason && (
                                        <p className="text-xs text-red-400 mt-1">Reason: {tpl.rejectionReason}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingId(tpl._id);
                                            setEditData({ name: tpl.name, content: tpl.content });
                                        }}
                                        className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-white text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tpl._id)}
                                        disabled={loading}
                                        className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-white text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
