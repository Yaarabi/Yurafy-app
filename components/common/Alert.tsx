"use client";

import React, { useEffect } from "react";

export default function Alert({ type, message, onClose }: { type: "error" | "success"; message: string; onClose?: () => void }) {
  useEffect(() => {
    const id = setTimeout(() => onClose && onClose(), 4500);
    return () => clearTimeout(id);
  }, [onClose]);
  const base = "p-3 rounded-md flex items-start gap-3";
  const cls = type === "error" ? `${base} bg-red-50 text-red-800 border border-red-100` : `${base} bg-green-50 text-green-800 border border-green-100`;
  return (
    <div role="alert" className={cls}>
      <div className="flex-1 text-sm">{message}</div>
      <button aria-label="Dismiss alert" onClick={() => onClose && onClose()} className="text-sm opacity-80 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}
