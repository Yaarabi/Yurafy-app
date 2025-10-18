
"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useAutomationSettings() {
    const [fetching, setFetching] = useState(true);
    const [settings, setSettings] = useState<any>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [account, setAccount] = useState<any>(null);

    const fetchSettings = async () => {
        setFetching(true);
        try {
        const [accRes, tplRes] = await Promise.all([
            fetch("/api/whatsapp/account", { cache: "no-store" }),
            fetch("/api/whatsapp/templates", { cache: "no-store" }),
        ]);
        const acc = await accRes.json();
        const tpls = await tplRes.json();
        setAccount(acc.account);
        setSettings(acc.account.settings || {});
        setTemplates(tpls.templates || []);
        } catch {
        toast.error("Failed to load automation settings");
        } finally {
        setFetching(false);
        }
    };

    const patch = async (payload: object) => {
        try {
        const res = await fetch("/api/whatsapp/account", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("Updated successfully");
        fetchSettings();
        } catch {
        toast.error("Update failed");
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    return { fetching, account, settings, templates, patch, refetch: fetchSettings };
}
