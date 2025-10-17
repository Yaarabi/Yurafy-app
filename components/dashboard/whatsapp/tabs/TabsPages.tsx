
"use client";
import { useState } from "react";
import ConnectionTab from "./ConnectionTab";
import AutomationTab from "./AutomationTab";
import TemplatesTab from "./TemplatesTab";
import AnalyticsTab from "./AnalyticsTab";
import TestPanelTab from "./TestPanelTab";

const tabs = [
    "Connection",
    "Automation Settings",
    "Templates",
    "Analytics",
    "Test Panel",
];

export default function WhatsAppIntegrationPage() {
    const [activeTab, setActiveTab] = useState("Connection");

    return (
        <div className="bg-gray-800 text-white min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">WhatsApp Integration</h1>

        {/* Tab buttons */}
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

        {/* Active tab content */}
        <div className="bg-gray-700 p-4 rounded shadow-md">
            {activeTab === "Connection" && <ConnectionTab />}
            {activeTab === "Automation Settings" && <AutomationTab />}
            {activeTab === "Templates" && <TemplatesTab />}
            {activeTab === "Analytics" && <AnalyticsTab />}
            {activeTab === "Test Panel" && <TestPanelTab />}
        </div>
        </div>
    );
}
