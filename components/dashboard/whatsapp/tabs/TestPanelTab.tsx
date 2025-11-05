"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FileText, User, Send, Loader2, MessageSquare, Phone } from "lucide-react";
import { ITemplate } from "@/models/templates";
import { IWhatsAppConversation } from "@/models/whatsappMessage";

export default function TestPanelTab() {
    const [templates, setTemplates] = useState<ITemplate[]>([]);
    const [contacts, setContacts] = useState<IWhatsAppConversation[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [selectedContact, setSelectedContact] = useState<string>("");
    const [variableValues, setVariableValues] = useState<Record<number, string>>({});
    const [preview, setPreview] = useState<string>("");

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        updatePreview();
    }, [selectedTemplate, variableValues, templates]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [templatesRes, contactsRes] = await Promise.all([
                fetch("/api/whatsapp/templates"),
                fetch("/api/whatsapp/conversations"),
            ]);

            if (!templatesRes.ok || !contactsRes.ok) {
                throw new Error("Failed to fetch data");
            }

            const templatesData = await templatesRes.json();
            const contactsData = await contactsRes.json();

            setTemplates(templatesData.templates || []);
            setContacts(contactsData.conversations || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load templates and contacts");
        } finally {
            setLoading(false);
        }
    };

    const updatePreview = () => {
        if (!selectedTemplate) {
            setPreview("");
            return;
        }

        const template = templates.find((t) => t._id === selectedTemplate);
        if (!template) {
            setPreview("");
            return;
        }

        let content = template.type === "TEXT" ? (template.content || "") : (template.caption || "");
        
        // Replace variables with values or placeholders
        // Templates use {{1}}, {{2}}, etc. as placeholders
        if (template.variables && template.variables.length > 0) {
            template.variables.forEach((varName, index) => {
                const placeholder = `{{${index + 1}}}`;
                const value = variableValues[index] || `[${varName || `Variable ${index + 1}`}]`;
                content = content.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
            });
        } else {
            // Also handle placeholders if no variables array is defined but content has {{1}}, {{2}}, etc.
            const placeholderRegex = /\{\{(\d+)\}\}/g;
            const matches = Array.from(content.matchAll(placeholderRegex));
            matches.forEach((match) => {
                const index = parseInt(match[1]) - 1;
                const value = variableValues[index] || `[Variable ${match[1]}]`;
                content = content.replace(match[0], value);
            });
        }

        setPreview(content);
    };

    const handleSend = async () => {
        if (!selectedTemplate) {
            toast.error("Please select a template");
            return;
        }

        if (!selectedContact) {
            toast.error("Please select a contact");
            return;
        }

        setSending(true);
        try {
            const template = templates.find((t) => t._id === selectedTemplate);
            if (!template) {
                toast.error("Template not found");
                return;
            }

            const contact = contacts.find((c) => c._id === selectedContact);
            if (!contact) {
                toast.error("Contact not found");
                return;
            }

            // Prepare variable values array
            const values: string[] = [];
            if (template.variables && template.variables.length > 0) {
                template.variables.forEach((_, index) => {
                    values.push(variableValues[index] || "");
                });
            }

            const res = await fetch("/api/whatsapp/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    templateId: selectedTemplate,
                    contactPhone: contact.customer.phone,
                    variableValues: values,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to send");
            }

            toast.success("Template message sent successfully!");
            
            // Reset form
            setSelectedTemplate("");
            setSelectedContact("");
            setVariableValues({});
            setPreview("");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const getSelectedTemplate = () => {
        return templates.find((t) => t._id === selectedTemplate);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    const template = getSelectedTemplate();
    const contact = contacts.find((c) => c._id === selectedContact);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Test Template Message
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select a template and contact to send a test message
                </p>
            </div>

            {/* Template Selection */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Select Template
                </label>
                <select
                    value={selectedTemplate}
                    onChange={(e) => {
                        setSelectedTemplate(e.target.value);
                        setVariableValues({});
                    }}
                    className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="">Choose a template...</option>
                    {templates.map((template) => (
                        <option key={template._id} value={template._id}>
                            {template.name} ({template.type}) 
                            {template.status !== "APPROVED" && ` [${template.status}]`}
                        </option>
                    ))}
                </select>
                {template && template.status !== "APPROVED" && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        Note: This template is {template.status.toLowerCase()}. It may not send properly.
                    </p>
                )}
            </div>

            {/* Contact Selection */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4 inline mr-2" />
                    Select Contact
                </label>
                <select
                    value={selectedContact}
                    onChange={(e) => setSelectedContact(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="">Choose a contact...</option>
                    {contacts.map((contact) => (
                        <option key={contact._id} value={contact._id}>
                            {contact.customer.name || "Unknown"} ({contact.customer.phone})
                        </option>
                    ))}
                </select>
            </div>

            {/* Variable Inputs */}
            {template && template.variables && template.variables.length > 0 && (
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Template Variables
                    </label>
                    {template.variables.map((varName, index) => (
                        <div key={index} className="space-y-1">
                            <label className="block text-xs text-gray-600 dark:text-gray-400">
                                {varName || `Variable ${index + 1}`}
                            </label>
                            <input
                                type="text"
                                value={variableValues[index] || ""}
                                onChange={(e) => {
                                    setVariableValues({
                                        ...variableValues,
                                        [index]: e.target.value,
                                    });
                                }}
                                placeholder={`Enter value for ${varName || `variable ${index + 1}`}`}
                                className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Preview */}
            {preview && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        Message Preview
                    </label>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-3 mb-2">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {contact?.customer.name || "Contact"}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {contact?.customer.phone}
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                {preview}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSend}
                    disabled={sending || !selectedTemplate || !selectedContact}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                    {sending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Send Test Message
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
