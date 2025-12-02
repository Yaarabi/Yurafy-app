'use client';

import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import toast from "react-hot-toast";

interface Template {
    _id: string;
    name: string;
    content: string;
    type: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
    link?: string;
    caption?: string;
    variables?: string[];
    buttons?: Array<{
        type: "QUICK_REPLY" | "URL" | "PHONE";
        text: string;
        payload?: "order_confirmation" | "cancel_order" | "edit_order";
        url?: string;
        phoneNumber?: string;
    }>;
}

export interface TemplateListRef {
    refresh: () => Promise<void>;
}

const TemplateList = forwardRef<TemplateListRef>((props, ref) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<{
        name: string;
        content: string;
        type: string;
        link?: string;
        caption?: string;
        variables?: string[];
        mediaFile?: File;
        buttons?: Template["buttons"];
    }>({
        name: "",
        content: "",
        type: "TEXT",
        link: "",
        caption: "",
        variables: [],
        mediaFile: undefined,
        buttons: [],
    });

    const fetchTemplates = async () => {
        try {
        setRefreshing(true);
        const res = await fetch("/api/whatsapp/templates", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch templates");
        const data = await res.json();
        setTemplates(Array.isArray(data.templates) ? data.templates : []);
        } catch (err) {
        console.error(err);
        toast.error("Could not load templates");
        } finally {
        setRefreshing(false);
        }
    };

    // Expose refresh function via ref
    useImperativeHandle(ref, () => ({
        refresh: fetchTemplates,
    }));

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleUpdate = async (id: string) => {
        if (!editData.name.trim() || (editData.type === "TEXT" && !editData.content.trim())) {
        toast.error("Name and content required");
        return;
        }
        setLoading(true);
        try {
        let link = editData.link;

        // If user selected a new file, call /api/upload PUT
        if (editData.type !== "TEXT" && editData.mediaFile) {
            const formData = new FormData();
            formData.append("file", editData.mediaFile);
            formData.append("oldUrls", JSON.stringify([editData.link]));

            const uploadRes = await fetch("/api/upload", {
            method: "PUT",
            body: formData,
            });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.message || "Upload failed");

            link = uploadData.url; // new full URL
        }

        // Update the template record
        const res = await fetch("/api/whatsapp/templates", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            id,
            name: editData.name,
            content: editData.content,
            type: editData.type,
            caption: editData.caption,
            variables: editData.variables,
            link,
            buttons: editData.buttons || [],
            }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update template");

        toast.success("Template updated");
        setEditingId(null);
        setEditData({
            name: "",
            content: "",
            type: "TEXT",
            link: "",
            caption: "",
            variables: [],
            mediaFile: undefined,
        });
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
        
        if (!res.ok) {
            const data = await res.json().catch(() => ({ error: "Unknown error" }));
            const errorMsg = typeof data.error === 'string' 
                ? data.error 
                : data.error?.message || "Failed to delete template";
            throw new Error(errorMsg);
        }

        const data = await res.json();
        
        if (data.success) {
            toast.success("Template deleted");
            fetchTemplates();
        } else {
            throw new Error("Delete operation did not complete successfully");
        }
        } catch (err: any) {
        console.error("Delete error:", err);
        toast.error(err.message || "Delete failed");
        } finally {
        setLoading(false);
        }
    };

    const renderStatusBadge = (status: Template["status"], reason?: string) => {
        let color = "bg-gray-500";
        if (status === "APPROVED") color = "bg-green-600";
        else if (status === "PENDING") color = "bg-yellow-600";
        else if (status === "REJECTED") color = "bg-red-600";
        else color = "bg-[var(--brand-blue)]"; // brand accent for other statuses
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
                {templates.length === 0 && !refreshing && <li className="text-sm text-gray-400">No templates yet.</li>}
                {refreshing && <li className="text-sm text-gray-400">Refreshing templates...</li>}
                {templates.map((tpl) => (
                    <li key={tpl._id} className="bg-white dark:bg-gray-700 p-3 rounded space-y-2 border border-gray-200 dark:border-gray-600">
                        {editingId === tpl._id ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                />
                                {editData.type === "TEXT" && (
                                    <textarea
                                        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                                        rows={3}
                                        value={editData.content}
                                        onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                                    />
                                )}
                                {editData.type !== "TEXT" && (
                                    <input
                                        type="text"
                                        placeholder="Media URL"
                                        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                                        value={editData.link}
                                        onChange={(e) => setEditData({ ...editData, link: e.target.value })}
                                    />
                                )}
                                <input
                                    type="text"
                                    placeholder="Caption"
                                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                                    value={editData.caption}
                                    onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
                                />
                                {/* Buttons Editor (Edit) */}
                                <div className="space-y-2 mt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Buttons</span>
                                        <button
                                            type="button"
                                            className="px-2 py-1 text-sm rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                                            onClick={() =>
                                                setEditData((d) => ({
                                                    ...d,
                                                    buttons: [
                                                        ...(d.buttons || []),
                                                        { type: "QUICK_REPLY", text: "", payload: "order_confirmation" },
                                                    ],
                                                }))
                                            }
                                        >
                                            + Add Button
                                        </button>
                                    </div>
                                    {(editData.buttons || []).map((b, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                            <select
                                                className="col-span-3 p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                                                value={b.type}
                                                onChange={(e) => {
                                                    const type = e.target.value as "QUICK_REPLY" | "URL" | "PHONE";
                                                    setEditData((d) => {
                                                        const arr = [ ...(d.buttons || []) ];
                                                        const updated: any = { ...arr[idx], type };
                                                        if (type === "QUICK_REPLY") {
                                                            delete updated.url; delete updated.phoneNumber;
                                                            if (!updated.payload) updated.payload = "order_confirmation";
                                                        } else if (type === "URL") {
                                                            delete updated.payload; delete updated.phoneNumber;
                                                        } else if (type === "PHONE") {
                                                            delete updated.payload; delete updated.url;
                                                        }
                                                        arr[idx] = updated;
                                                        return { ...d, buttons: arr };
                                                    });
                                                }}
                                            >
                                                <option value="QUICK_REPLY">Quick Reply</option>
                                                <option value="URL">URL</option>
                                                <option value="PHONE">Phone</option>
                                            </select>
                                            <input
                                                className="col-span-3 p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                                                placeholder="Button text"
                                                value={b.text}
                                                onChange={(e) =>
                                                    setEditData((d) => {
                                                        const arr = [ ...(d.buttons || []) ];
                                                        arr[idx] = { ...(arr[idx] as any), text: e.target.value } as any;
                                                        return { ...d, buttons: arr };
                                                    })
                                                }
                                            />
                                            {b.type === "QUICK_REPLY" && (
                                                <select
                                                    className="col-span-4 p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                                                    value={b.payload || "order_confirmation"}
                                                    onChange={(e) =>
                                                        setEditData((d) => {
                                                            const arr = [ ...(d.buttons || []) ];
                                                            arr[idx] = { ...(arr[idx] as any), payload: e.target.value as any } as any;
                                                            return { ...d, buttons: arr };
                                                        })
                                                    }
                                                >
                                                    <option value="order_confirmation">order_confirmation</option>
                                                    <option value="cancel_order">cancel_order</option>
                                                    <option value="edit_order">edit_order</option>
                                                </select>
                                            )}
                                            {b.type === "URL" && (
                                                <input
                                                    className="col-span-4 p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                                                    placeholder="https://... (can include {{1}})"
                                                    value={b.url || ""}
                                                    onChange={(e) =>
                                                        setEditData((d) => {
                                                            const arr = [ ...(d.buttons || []) ];
                                                            arr[idx] = { ...(arr[idx] as any), url: e.target.value } as any;
                                                            return { ...d, buttons: arr };
                                                        })
                                                    }
                                                />
                                            )}
                                            {b.type === "PHONE" && (
                                                <input
                                                    className="col-span-4 p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                                                    placeholder="Phone number (E.164)"
                                                    value={b.phoneNumber || ""}
                                                    onChange={(e) =>
                                                        setEditData((d) => {
                                                            const arr = [ ...(d.buttons || []) ];
                                                            arr[idx] = { ...(arr[idx] as any), phoneNumber: e.target.value } as any;
                                                            return { ...d, buttons: arr };
                                                        })
                                                    }
                                                />
                                            )}
                                            <button
                                                type="button"
                                                className="col-span-2 px-2 py-1 text-sm rounded bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-100 hover:opacity-90"
                                                onClick={() =>
                                                    setEditData((d) => ({
                                                        ...d,
                                                        buttons: (d.buttons || []).filter((_, i) => i !== idx),
                                                    }))
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdate(tpl._id)}
                                        disabled={loading}
                                        className="bg-[var(--brand-blue)] hover:opacity-90 px-3 py-1 rounded text-white"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingId(null);
                                            setEditData({ name: "", content: "", type: "TEXT", link: "", caption: "", variables: [] });
                                        }}
                                        className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 px-3 py-1 rounded text-gray-900 dark:text-white"
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
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{tpl.content || tpl.link}</p>
                                    {Array.isArray(tpl.buttons) && tpl.buttons.length > 0 && (
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                                            Buttons: {tpl.buttons.map((b) => b.text).join(", ")}
                                        </div>
                                    )}
                                    {tpl.status === "REJECTED" && tpl.rejectionReason && (
                                        <p className="text-xs text-red-400 mt-1">Reason: {tpl.rejectionReason}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingId(tpl._id);
                                            setEditData({
                                                name: tpl.name,
                                                content: tpl.content || "",
                                                type: tpl.type,
                                                link: tpl.link || "",
                                                caption: tpl.caption || "",
                                                variables: tpl.variables || [],
                                            });
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
});

TemplateList.displayName = 'TemplateList';

export default TemplateList;
