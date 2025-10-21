'use client';

import { useEffect, useState } from 'react';
import { IWhatsAppConversation } from '@/models/whatsappMessage';
import toast from 'react-hot-toast';
import { FaUser } from 'react-icons/fa';

export default function ContactsTab() {
    const [conversations, setConversations] = useState<IWhatsAppConversation[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/whatsapp/conversations');
                if (!res.ok) throw new Error('Failed to fetch conversations');
                const data = await res.json();
                setConversations(data.conversations || []);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load contacts');
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    const filtered = conversations.filter((c) =>
        (c.customer.name || c.customer.phone).toLowerCase().includes(search.toLowerCase())
    );

    const saveName = async (convId: string) => {
        if (!editingName.trim()) return toast.error('Name cannot be empty');
        try {
            const res = await fetch(`/api/whatsapp/conversations?id=${convId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingName }),
            });
            if (!res.ok) throw new Error('Failed to update name');

            setConversations((prev) =>
                prev.map((c) =>
                    c._id === convId
                        ? { ...c, customer: { ...c.customer, name: editingName } }
                        : c
                )
            );
            toast.success('Name updated!');
            setEditingId(null);
            setEditingName('');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update name');
        }
    };

    return (
        <div className="flex flex-col h-full p-4">
            <input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-2 rounded bg-gray-700 text-white placeholder-gray-400 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <p className="text-gray-400 text-center mt-4">Loading...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-gray-400 text-center mt-4">No contacts found.</p>
                ) : (
                    filtered.map((conv) => {
                        const name = conv.customer.name || conv.customer.phone;

                        return (
                            <div
                                key={conv._id}
                                className="w-full flex items-center justify-between px-4 py-3 mb-2 rounded hover:bg-gray-700 transition"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 flex items-center justify-center bg-gray-600 rounded-full text-white flex-shrink-0">
                                        <FaUser className="text-lg" />
                                    </div>

                                    {editingId === conv._id ? (
                                        <div className="flex gap-2 flex-1">
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className="flex-1 p-1 rounded bg-gray-600 text-white outline-none"
                                            />
                                            <button
                                                onClick={() => saveName(conv._id)}
                                                className="px-2 py-1 bg-green-600 rounded text-white"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setEditingName('');
                                                }}
                                                className="px-2 py-1 bg-red-600 rounded text-white"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="font-medium text-white">{name}</span>
                                    )}
                                </div>

                                {editingId !== conv._id && (
                                    <button
                                        onClick={() => {
                                            setEditingId(conv._id);
                                            setEditingName(conv.customer.name || '');
                                        }}
                                        className="text-xs text-blue-400 hover:underline flex-shrink-0"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
