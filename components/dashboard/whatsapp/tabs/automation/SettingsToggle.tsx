
"use client";
import React from "react";

export default function SettingsToggle({ label, value, onChange, disabled }: any) {
    return (
        <div className="bg-gray-700 p-4 rounded flex items-center justify-between">
        <label className="text-white font-medium">{label}</label>
        <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
        />
        </div>
    );
}
