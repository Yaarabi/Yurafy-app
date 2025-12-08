"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";

const GOOGLE_SHEETS_LOGO =
  "https://www.gstatic.com/images/branding/product/1x/sheets_64dp.png";

const ORDER_STATUS_OPTIONS = [
  "new",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const AVAILABLE_VARIABLES = [
  { key: "orderId", label: "Order ID" },
  { key: "customerName", label: "Customer Name" },
  { key: "customerEmail", label: "Customer Email" },
  { key: "customerPhone", label: "Customer Phone" },
  { key: "orderStatus", label: "Order Status" },
  { key: "totalAmount", label: "Total Amount" },
  { key: "products", label: "Products" },
  { key: "shippingAddress", label: "Shipping Address" },
  { key: "createdAt", label: "Order Date" },
  { key: "deliveryInstructions", label: "Delivery Instructions" },
];

interface GoogleSheetIntegration {
  _id?: string;
  clientId?: string;
  clientSecret?: string;
  spreadsheetId?: string;
  sheetName?: string;
  variables?: string[];
  orderStatus?: string;
  autoSend?: boolean;
  enabled?: boolean;
}

export default function GoogleSheetsForm({
  onClose,
  onSaved,
  initial,
}: {
  onClose: () => void;
  onSaved?: (data: any) => void;
  initial?: GoogleSheetIntegration;
}) {
  // Form step: 1=credentials, 2=configuration
  const [step, setStep] = useState(initial?._id ? 2 : 1);

  // Credentials (Step 1)
  const [clientId, setClientId] = useState(initial?.clientId || "");
  const [clientSecret, setClientSecret] = useState(initial?.clientSecret || "");

  // Configuration (Step 2)
  const [spreadsheetId, setSpreadsheetId] = useState(
    initial?.spreadsheetId || ""
  );
  const [sheetName, setSheetName] = useState(initial?.sheetName || "Sheet1");
  const [variables, setVariables] = useState<string[]>(
    initial?.variables || ["orderId", "customerName", "totalAmount", "orderStatus"]
  );
  const [orderStatus, setOrderStatus] = useState(
    initial?.orderStatus || "confirmed"
  );
  const [autoSend, setAutoSend] = useState(initial?.autoSend ?? true);
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIntegration, setSavedIntegration] =
    useState<GoogleSheetIntegration | null>(initial || null);

  const isEdit = !!initial?._id;

  // Handle credentials submission (Step 1 → Step 2)
  async function handleCredsSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clientId.trim() || !clientSecret.trim()) {
      setError("Both Client ID and Client Secret are required");
      return;
    }

    setStep(2);
  }

  // Handle saving integration (Step 2)
  async function handleSaveIntegration(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!spreadsheetId.trim() || !sheetName.trim()) {
      setError("Spreadsheet ID and Sheet Name are required");
      setLoading(false);
      return;
    }

    if (variables.length === 0) {
      setError("Select at least one variable to send");
      setLoading(false);
      return;
    }

    try {
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch("/api/integrations/google-sheets", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientSecret,
          spreadsheetId,
          sheetName,
          variables,
          orderStatus,
          autoSend,
          enabled,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save integration");

      setSavedIntegration(data.account || data.integration);
      onSaved?.(data.account || data.integration);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  // Handle variable toggle
  function toggleVariable(variable: string) {
    setVariables((prev) =>
      prev.includes(variable)
        ? prev.filter((v) => v !== variable)
        : [...prev, variable]
    );
  }

  // Handle delete
  async function handleDelete() {
    if (!confirm("Delete Google Sheets integration? This cannot be undone."))
      return;

    setLoading(true);
    try {
      const res = await fetch("/api/integrations/google-sheets", {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");
      setSavedIntegration(null);
      onSaved?.(null);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <img
            src={GOOGLE_SHEETS_LOGO}
            alt="Google Sheets"
            className="w-10 h-10 sm:w-12 sm:h-12"
          />
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Google Sheets Integration
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {step === 1 ? "Step 1: Enter Credentials" : "Step 2: Configure Sheet"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <form
            onSubmit={step === 1 ? handleCredsSubmit : handleSaveIntegration}
            className="p-4 sm:p-6 space-y-6"
          >
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}

            {step === 1 ? (
              // Step 1: Credentials
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Get your OAuth credentials:</strong>
                  </p>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-xs text-blue-700 dark:text-blue-400">
                    <li>
                      Go to{" "}
                      <a
                        href="https://console.cloud.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold"
                      >
                        Google Cloud Console
                      </a>
                    </li>
                    <li>Create or select a project</li>
                    <li>Enable the Google Sheets API</li>
                    <li>
                      Go to Credentials and create an "OAuth 2.0 Client ID"
                    </li>
                    <li>Choose "Desktop application" and download JSON</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="e.g., YOUR_CLIENT_ID.apps.googleusercontent.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="Your client secret"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Your credentials are encrypted before storage
                  </p>
                </div>
              </motion.div>
            ) : (
              // Step 2: Configuration
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {savedIntegration && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      ✓ Integration configured
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Spreadsheet ID
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Find this in the URL: docs.google.com/spreadsheets/d/
                    <strong>SPREADSHEET_ID</strong>/edit
                  </p>
                  <input
                    type="text"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sheet Name
                  </label>
                  <input
                    type="text"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="e.g., Orders"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Trigger Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Send order when status is...
                  </label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {ORDER_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variables Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select variables to send
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AVAILABLE_VARIABLES.map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <input
                          type="checkbox"
                          checked={variables.includes(key)}
                          onChange={() => toggleVariable(key)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                    {variables.length === 0
                      ? "Select at least one variable"
                      : `${variables.length} variable${variables.length === 1 ? "" : "s"} selected`}
                  </p>
                </div>

                {/* Auto Send */}
                <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSend}
                    onChange={(e) => setAutoSend(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Auto-send
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Automatically send when status changes
                    </p>
                  </div>
                </label>

                {/* Enabled */}
                <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Enabled
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Integration is active
                    </p>
                  </div>
                </label>
              </motion.div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
          {savedIntegration && step === 2 && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              Delete Integration
            </button>
          )}

          <button
            onClick={
              step === 2
                ? onClose
                : () => {
                    setStep(1);
                    onClose();
                  }
            }
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition"
          >
            {step === 2 ? "Close" : "Cancel"}
          </button>

          {step === 1 && (
            <button
              onClick={handleCredsSubmit}
              disabled={loading || !clientId || !clientSecret}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 rounded-lg text-sm font-medium transition disabled:cursor-not-allowed"
            >
              Continue
            </button>
          )}

          {step === 2 && (
            <button
              onClick={handleSaveIntegration}
              disabled={loading || variables.length === 0}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 rounded-lg text-sm font-medium transition disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
