"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

type Note = { _id?: string; guestName?: string; contact?: string; note: string; createdAt?: string };

export default function AdminSupportAgent() {
  const [prompt, setPrompt] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [cfgRes, notesRes] = await Promise.all([
        fetch(`/api/supportagent`),
        fetch(`/api/supportagent/notes`),
      ]);

      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        setPrompt(cfg?.prompt || "");
      }

      if (notesRes.ok) {
        const ns = await notesRes.json();
        setNotes(ns || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load support agent data");
    } finally {
      setLoading(false);
    }
  }

  async function savePrompt() {
    setSaving(true);
    try {
      const res = await fetch(`/api/supportagent`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Failed to save");
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to save prompt");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id?: string) {
    if (!id) return;
    try {
      const res = await fetch(`/api/supportagent/notes?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete note");
      const updated = await res.json();
      setNotes(updated || []);
    } catch (err) {
      console.error(err);
      setError("Failed to delete note");
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-2">Support Agent Prompt</h3>
        <p className="text-sm text-gray-500 mb-3">Edit the system prompt used by the support agent.</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full min-h-[120px] p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm"
        />
        <div className="mt-3 flex gap-2">
          <button
            onClick={savePrompt}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Prompt"}
          </button>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md"
          >
            Reload
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-2">Notes</h3>
        <p className="text-sm text-gray-500 mb-3">Notes collected by the agent (guest name, contact and note). You can delete entries.</p>

        {loading ? (
          <p className="text-sm text-gray-500">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-gray-500">No notes yet.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((n) => (
              <div key={n._id} className="flex items-start justify-between gap-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.guestName || "Guest"}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 truncate">{n.contact}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-200 mt-1">{n.note}</div>
                  <div className="text-xs text-gray-400 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</div>
                </div>
                <div>
                  <button
                    onClick={() => deleteNote(n._id)}
                    title="Delete note"
                    className="p-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}
