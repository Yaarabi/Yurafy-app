"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package, Plus, Edit2, Trash2, Loader2, Save, X,
    DollarSign, Calendar, Settings, Store, MessageCircle,
    Bot, BarChart3, ShoppingCart, Headphones
} from "lucide-react";
import toast from "react-hot-toast";

interface PlanTemplate {
    _id: string;
    planKey: string;
    name: string;
    description: string;
    defaultPrice: number;
    defaultDurationDays: number;
    features: any;
    icon?: string;
    color?: string;
    isDefault: boolean;
    isActive: boolean;
    displayOrder: number;
}

const defaultFeatures = {
    store: { enabled: false, maxProducts: null, customDomain: false, customTheme: false, customCSS: false, customJS: false, seo: false, analytics: false },
    whatsapp: { enabled: false, automation: false, templates: false, broadcasts: false, maxContacts: null },
    ai: { enabled: false, agent: false, contentGeneration: false, autoResponses: false, languageSupport: [] },
    orders: { enabled: false, maxOrders: null, orderTracking: false, notifications: false },
    analytics: { enabled: false, advancedReports: false, exportData: false },
    support: { enabled: false, priority: false, email: false, chat: false },
};

export default function AdminPlanManagement() {
    const [plans, setPlans] = useState<PlanTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PlanTemplate | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        planKey: "", name: "", description: "", defaultPrice: 0,
        defaultDurationDays: 30, features: JSON.parse(JSON.stringify(defaultFeatures)),
        icon: "store", color: "from-blue-400 to-blue-600", isActive: true, displayOrder: 0,
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/plan-templates");
            if (!res.ok) throw new Error("Failed to fetch plans");
            const data = await res.json();
            setPlans(data.templates || []);
        } catch (err) {
            toast.error("Failed to load plans");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPlan(null);
        setFormData({
            planKey: "", name: "", description: "", defaultPrice: 0,
            defaultDurationDays: 30, features: JSON.parse(JSON.stringify(defaultFeatures)),
            icon: "store", color: "from-blue-400 to-blue-600", isActive: true, displayOrder: plans.length,
        });
        setShowModal(true);
    };

    const handleEdit = (plan: PlanTemplate) => {
        setEditingPlan(plan);
        setFormData({
            planKey: plan.planKey, name: plan.name, description: plan.description,
            defaultPrice: plan.defaultPrice, defaultDurationDays: plan.defaultDurationDays,
            features: JSON.parse(JSON.stringify(plan.features)),
            icon: plan.icon || "store", color: plan.color || "from-blue-400 to-blue-600",
            isActive: plan.isActive, displayOrder: plan.displayOrder,
        });
        setShowModal(true);
    };

    const handleDelete = async (planId: string, isDefault: boolean) => {
        if (isDefault) return toast.error("Cannot delete default plans");
        if (!confirm("Deactivate this plan?")) return;
        try {
            setDeletingId(planId);
            const res = await fetch(`/api/admin/plan-templates?id=${planId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Plan deactivated");
            fetchPlans();
        } catch (err) {
            toast.error("Failed to delete plan");
        } finally {
            setDeletingId(null);
        }
    };

    const handleSave = async () => {
        if (!formData.planKey || !formData.name || !formData.description) {
            return toast.error("Fill in all required fields");
        }
        try {
            setSaving(true);
            const url = editingPlan ? `/api/admin/plan-templates?id=${editingPlan._id}` : "/api/admin/plan-templates";
            const method = editingPlan ? "PUT" : "POST";
            const res = await fetch(url, {
                method, headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to save");
            }
            toast.success(editingPlan ? "Plan updated" : "Plan created");
            setShowModal(false);
            fetchPlans();
        } catch (err: any) {
            toast.error(err.message || "Failed to save plan");
        } finally {
            setSaving(false);
        }
    };

    const updateFeature = (category: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [category]: { ...prev.features[category], [field]: value },
            },
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Package className="w-6 h-6 text-indigo-600" />
                        Plan Templates Management
                    </h2>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Plan
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <motion.div
                            key={plan._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-gradient-to-br ${plan.color || "from-blue-400 to-blue-600"} rounded-xl p-6 text-white shadow-lg`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                    <p className="text-white/90 text-sm mb-3">{plan.description}</p>
                                </div>
                                {plan.isDefault && (
                                    <span className="px-2 py-1 bg-white/20 rounded text-xs font-semibold">Default</span>
                                )}
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/80">Price:</span>
                                    <span className="font-bold">${plan.defaultPrice}/mo</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/80">Duration:</span>
                                    <span className="font-bold">{plan.defaultDurationDays} days</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/80">Status:</span>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${plan.isActive ? "bg-green-500/30" : "bg-red-500/30"}`}>
                                        {plan.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-4 border-t border-white/20">
                                <button
                                    onClick={() => handleEdit(plan)}
                                    className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                                {!plan.isDefault && (
                                    <button
                                        onClick={() => handleDelete(plan._id, plan.isDefault)}
                                        disabled={deletingId === plan._id}
                                        className="px-3 py-2 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-1"
                                    >
                                        {deletingId === plan._id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {plans.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No plan templates found. Create your first plan!</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {editingPlan ? "Edit Plan" : "Create New Plan"}
                                    </h3>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Plan Key <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.planKey}
                                            onChange={(e) => setFormData({ ...formData, planKey: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                                            placeholder="e.g., enterprise-plan"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            disabled={!!editingPlan}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Display Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Enterprise Plan"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Plan description..."
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <DollarSign className="w-4 h-4 inline mr-1" />
                                            Price ($) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.defaultPrice}
                                            onChange={(e) => setFormData({ ...formData, defaultPrice: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Duration (days) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.defaultDurationDays}
                                            onChange={(e) => setFormData({ ...formData, defaultDurationDays: parseInt(e.target.value) || 30 })}
                                            min="1"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Display Order
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.displayOrder}
                                            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Active (available for selection)</span>
                                    </label>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Settings className="w-5 h-5" />
                                        Features Configuration
                                    </h4>

                                    {["store", "whatsapp", "ai", "orders", "analytics", "support"].map((category) => (
                                        <div key={category} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-3">
                                                {category === "store" && <Store className="w-5 h-5 text-blue-600" />}
                                                {category === "whatsapp" && <MessageCircle className="w-5 h-5 text-green-600" />}
                                                {category === "ai" && <Bot className="w-5 h-5 text-purple-600" />}
                                                {category === "orders" && <ShoppingCart className="w-5 h-5 text-orange-600" />}
                                                {category === "analytics" && <BarChart3 className="w-5 h-5 text-indigo-600" />}
                                                {category === "support" && <Headphones className="w-5 h-5 text-pink-600" />}
                                                <h5 className="font-semibold text-gray-900 dark:text-white capitalize">{category} Features</h5>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.features[category].enabled}
                                                        onChange={(e) => updateFeature(category, "enabled", e.target.checked)}
                                                        className="w-4 h-4 text-indigo-600 rounded"
                                                    />
                                                    <span className="text-sm">Enable {category}</span>
                                                </label>
                                                {formData.features[category].enabled && Object.keys(formData.features[category]).filter(k => k !== "enabled" && k !== "languageSupport").map((field) => (
                                                    <label key={field} className="flex items-center gap-2 cursor-pointer">
                                                        {field === "maxProducts" || field === "maxContacts" || field === "maxOrders" ? (
                                                            <div className="w-full">
                                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                    Max {field.replace("max", "").replace(/([A-Z])/g, " $1").trim()}
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={formData.features[category][field] || ""}
                                                                    onChange={(e) => updateFeature(category, field, e.target.value ? parseInt(e.target.value) : null)}
                                                                    placeholder="Unlimited if empty"
                                                                    className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.features[category][field]}
                                                                    onChange={(e) => updateFeature(category, field, e.target.checked)}
                                                                    className="w-4 h-4 text-indigo-600 rounded"
                                                                />
                                                                <span className="text-sm">{field.replace(/([A-Z])/g, " $1").trim()}</span>
                                                            </>
                                                        )}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {editingPlan ? "Update Plan" : "Create Plan"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
