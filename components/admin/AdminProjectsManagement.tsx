"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Plus, Edit, Trash2, Loader2, Save, X, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface Project {
    _id?: string;
    name: string;
    link: string;
    img: string;
    order: number;
    isActive: boolean;
}

export default function AdminProjectsManagement() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchProjects(); }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/projects');
            if (!res.ok) throw new Error('Failed to fetch projects');
            const data = await res.json();
            setProjects(data.projects || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load projects');
        } finally { setLoading(false); }
    };

    const openCreate = () => {
        setEditing({ name: '', link: '', img: '', order: 0, isActive: true });
        setIsModalOpen(true);
    };

    const openEdit = (p: Project) => { setEditing({ ...p }); setIsModalOpen(true); };

    const handleSave = async () => {
        if (!editing) return;
        try {
            setSaving(true);
            const method = editing._id ? 'PATCH' : 'POST';
            const body: any = editing._id ? { ...editing, projectId: editing._id } : editing;
            const res = await fetch('/api/admin/projects', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error('Save failed');
            toast.success(editing._id ? 'Project updated' : 'Project created');
            setIsModalOpen(false); setEditing(null); fetchProjects();
        } catch (err) { console.error(err); toast.error('Failed to save project'); } finally { setSaving(false); }
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !editing) return;

        const file = files[0];
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error('File too large. Max 10MB');
            return;
        }

        try {
            const { uploadFile } = await import('@/lib/utils/upload');
            const result = await uploadFile(file);
            if (result.success) {
                setEditing({ ...editing, img: result.data.url });
                toast.success('Image uploaded');
            } else {
                console.error('Upload error', result.error);
                toast.error(result.error?.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload exception', err);
            toast.error('Upload failed');
        }
    };

    const handleDelete = async (id?: string) => {
        if (!id) return;
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            const res = await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            toast.success('Project deleted');
            fetchProjects();
        } catch (err) { console.error(err); toast.error('Failed to delete project'); }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Projects Management</h2>
                    <p className="text-gray-600">Manage web development projects shown on the services page</p>
                </div>
                <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Project
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Link</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 hidden md:table-cell">Image</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Order</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {projects.map(p => (
                                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-4 py-3 text-sm">{p.name}</td>
                                    <td className="px-4 py-3 text-sm truncate max-w-xs"><a className="text-indigo-600 hover:underline" href={p.link} target="_blank" rel="noreferrer">{p.link}</a></td>
                                    <td className="px-4 py-3 hidden md:table-cell"><img src={p.img} alt={p.name} className="w-28 h-16 object-cover rounded" /></td>
                                    <td className="px-4 py-3 text-center">{p.order}</td>
                                    <td className="px-4 py-3 text-center">{p.isActive ? <span className="text-green-700">Active</span> : <span className="text-gray-500">Inactive</span>}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => openEdit(p)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(p._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {projects.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">No projects found. Create your first project!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && editing && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6">
                            <h3 className="text-xl font-semibold mb-4">{editing._id ? 'Edit Project' : 'Create Project'}</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium">Name</label>
                                    <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-4 py-2 border rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Link</label>
                                    <input value={editing.link} onChange={(e) => setEditing({ ...editing, link: e.target.value })} className="w-full px-4 py-2 border rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Image URL or upload</label>
                                    <input value={editing.img} onChange={(e) => setEditing({ ...editing, img: e.target.value })} className="w-full px-4 py-2 border rounded mb-2" placeholder="https://... or use upload below" />

                                    <div className="flex items-center gap-3">
                                        <label className="inline-flex items-center cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:opacity-90">
                                            <UploadCloud className="w-4 h-4 mr-2" />
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                            Upload image
                                        </label>
                                        {editing.img && (
                                            <button onClick={() => setEditing({ ...editing, img: '' })} className="px-3 py-2 bg-red-50 text-red-600 rounded">Remove</button>
                                        )}
                                    </div>

                                    {editing.img && (
                                        <div className="mt-3">
                                            <img src={editing.img} alt="Preview" className="w-full md:w-48 h-28 object-cover rounded border border-gray-200" />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">Order</label>
                                        <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border rounded" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Active</label>
                                        <div className="mt-2">
                                            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> Active</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={handleSave} disabled={saving || !editing.name || !editing.link || !editing.img} className="px-6 py-2 bg-indigo-600 text-white rounded disabled:opacity-50 flex items-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-gray-200 rounded">Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
