

"use client";
import { useState } from "react";
import ConnectionTab from "./ConnectionTab";
import AutomationTab from "./AutomationTab";
import LogsTab from "./LogsTab";
import TestPanelTab from "./TestPanelTab";

const tabs = ["Connection", "Automation Settings", "Message Logs", "Test Panel"];

export default function WhatsAppIntegrationPage() {
    const [activeTab, setActiveTab] = useState("Connection");

    return (
        <div className="bg-gray-800 text-white min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">WhatsApp Integration</h1>
        <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded ${
                activeTab === tab ? "bg-green-600" : "bg-gray-700"
                } hover:bg-green-500 transition`}
            >
                {tab}
            </button>
            ))}
        </div>

        <div className="bg-gray-700 p-4 rounded shadow-md">
            {activeTab === "Connection" && <ConnectionTab />}
            {activeTab === "Automation Settings" && <AutomationTab />}
            {activeTab === "Message Logs" && <LogsTab />}
            {activeTab === "Test Panel" && <TestPanelTab />}
        </div>
        </div>
    );
}
