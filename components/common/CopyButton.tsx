"use client";

import React, { useState } from "react";

export default function CopyButton({ value, label, className }: { value?: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  async function doCopy() {
    if (!value) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(value);
      else {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error("Copy failed", e);
    }
  }
  return (
    <button
      onClick={doCopy}
      disabled={!value}
      aria-label={label || "Copy"}
      className={`${className || "px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm"} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand-blue)]`}
    >
      {copied ? "Copied!" : label || "Copy"}
    </button>
  );
}
