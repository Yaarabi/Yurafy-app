"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import LogoLoader from "@/components/themePreview/loadder";
import GoogleSheetsForm from "@/components/dashboard/integrations/GoogleSheetsForm";
import { useTranslations } from "next-intl";
import { FileText, Plus, AlertCircle } from "lucide-react";

const GOOGLE_SHEETS_LOGO =
  "https://www.gstatic.com/images/branding/product/1x/sheets_64dp.png";

interface GoogleSheetIntegration {
  _id?: string;
  spreadsheetId?: string;
  sheetName?: string;
  variables?: string[];
  orderStatus?: string;
  autoSend?: boolean;
  enabled?: boolean;
}

export default function GoogleSheetsIntegrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("dashboard");

  const [integration, setIntegration] = useState<GoogleSheetIntegration | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for success
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setSuccessMessage("✓ Successfully configured Google Sheets integration!");
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [searchParams]);

  // Fetch integration
  useEffect(() => {
    async function fetchIntegration() {
      try {
        const res = await fetch("/api/integrations/google-sheets");
        const data = await res.json();
        if (res.ok) {
          setIntegration(data.account || data.integration);
        }
      } catch (err: any) {
        console.error("Error fetching integration:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchIntegration();
  }, []);

  if (loading) return <LogoLoader />;

  const isConnected = integration?._id && integration?.enabled;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4 flex items-center gap-2"
          >
            ← Back
          </button>

          <div className="flex items-center gap-4">
            <img
              src={GOOGLE_SHEETS_LOGO}
              alt="Google Sheets"
              className="w-12 h-12 sm:w-14 sm:h-14"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
                Google Sheets Integration
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Send selected order data to Google Sheets when status changes
              </p>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-center gap-3"
          >
            <span className="text-lg">✓</span>
            <span className="text-sm font-medium">{successMessage}</span>
          </motion.div>
        )}

        {/* Main Content */}
        {!isConnected ? (
          // Not connected state
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Connect Your Google Sheet
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send selected order information to your Google Sheets when order
                    status changes. Choose which variables to sync and when to trigger
                    the sync.
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  {
                    icon: "✓",
                    title: "Variable Selection",
                    desc: "Choose which order fields to send",
                  },
                  {
                    icon: "🔄",
                    title: "Status-based Trigger",
                    desc: "Send on a specific order status",
                  },
                  {
                    icon: "⏱️",
                    title: "Auto or Manual",
                    desc: "Automatic or manual sending options",
                  },
                  {
                    icon: "🔒",
                    title: "Secure",
                    desc: "Your credentials encrypted before storage",
                  },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Configure Integration
              </button>
            </div>

            {/* Setup Guide */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 sm:p-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How to Set Up
              </h3>
              <ol className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white font-medium text-xs">
                    1
                  </span>
                  <div>
                    <strong>Get OAuth Credentials:</strong>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Create an OAuth 2.0 app in Google Cloud Console and note your
                      Client ID and Secret
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white font-medium text-xs">
                    2
                  </span>
                  <div>
                    <strong>Click "Configure Integration":</strong>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Enter your Client ID and Secret
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white font-medium text-xs">
                    3
                  </span>
                  <div>
                    <strong>Enter Sheet Details:</strong>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Provide Spreadsheet ID, Sheet Name, and select variables
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white font-medium text-xs">
                    4
                  </span>
                  <div>
                    <strong>Configure Trigger:</strong>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Choose order status that triggers sending and enable auto-send
                    </p>
                  </div>
                </li>
              </ol>
            </motion.div>
          </motion.div>
        ) : (
          // Connected state
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3">
                    ✓ Integration Active
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-green-600 dark:text-green-500 font-medium">
                        Spreadsheet
                      </p>
                      <p className="text-green-700 dark:text-green-400 break-all">
                        {integration.spreadsheetId}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 dark:text-green-500 font-medium">
                        Sheet Name
                      </p>
                      <p className="text-green-700 dark:text-green-400">
                        {integration.sheetName}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 dark:text-green-500 font-medium">
                        Trigger Status
                      </p>
                      <p className="text-green-700 dark:text-green-400 capitalize">
                        {integration.orderStatus}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-green-600 dark:text-green-500 font-medium text-xs mb-2">
                      Sending: {integration.variables?.length || 0} variables
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {integration.variables?.map((v) => (
                        <span
                          key={v}
                          className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded text-xs"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition text-sm"
              >
                Edit Configuration
              </button>
              <button
                onClick={() => setIntegration(null)}
                className="px-6 py-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition text-sm"
              >
                Disconnect
              </button>
            </div>
          </motion.div>
        )}

        {/* Form Modal */}
        {showForm && (
          <GoogleSheetsForm
            onClose={() => setShowForm(false)}
            onSaved={(data) => {
              setIntegration(data);
              setShowForm(false);
            }}
            initial={integration || undefined}
          />
        )}
      </div>
    </div>
  );
}
