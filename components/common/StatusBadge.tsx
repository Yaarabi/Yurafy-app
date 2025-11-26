"use client";

import React from "react";

export default function StatusBadge({ connected }: { connected?: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${connected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}
      aria-live="polite"
    >
      {connected ? "Connected" : "Not connected"}
    </span>
  );
}
