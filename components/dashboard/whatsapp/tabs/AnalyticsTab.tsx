
"use client";

import { useEffect, useState } from "react";

interface Analytics {
    sent: number;
    delivered: number;
    read: number;
    replied: number;
}

export default function AnalyticsTab() {
    const [stats, setStats] = useState<Analytics | null>(null);

    const fetchAnalytics = async () => {
        try {
        const res = await fetch("/api/whatsapp/analytics");
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const data = await res.json();
        setStats(data.analytics);
        } catch (err) {
        console.error(err);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (!stats) return <p className="text-gray-400">Loading analytics...</p>;

    const deliveryRate = ((stats.delivered / stats.sent) * 100).toFixed(1);
    const readRate = ((stats.read / stats.delivered) * 100).toFixed(1);
    const replyRate = ((stats.replied / stats.read) * 100).toFixed(1);

    return (
        <div className="space-y-6">
        <h2 className="text-xl font-semibold">Analytics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-4 rounded">
            <p className="text-lg font-bold">{stats.sent}</p>
            <p className="text-sm text-gray-300">Sent</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
            <p className="text-lg font-bold">{stats.delivered}</p>
            <p className="text-sm text-gray-300">Delivered ({deliveryRate}%)</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
            <p className="text-lg font-bold">{stats.read}</p>
            <p className="text-sm text-gray-300">Read ({readRate}%)</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
            <p className="text-lg font-bold">{stats.replied}</p>
            <p className="text-sm text-gray-300">Replied ({replyRate}%)</p>
            </div>
        </div>
        </div>
    );
}
