'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ITemplate } from '@/models/templates';
import { DetectionRule } from './types';
import AddDetectionRuleModal from './NewDetectionRuleForm';
import AutomationGrid from './WorkflowGrid';

interface Settings {
    autoReply: boolean;
    orderConfirmation: boolean;
    ad: boolean;
}

interface AccountResponse {
    account: {
        settings: Settings;
        detectionRules: DetectionRule[];
        preferredTemplates?: {
            greeting?: string;
            orderConfirmation?: string;
            ad?: string;
        };
    };
}

interface TemplatesResponse {
    templates: ITemplate[];
}

interface PatchResponse {
    success?: boolean;
    error?: string;
}

export default function AutomationTab() {
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<Settings>({ autoReply: false, orderConfirmation: false, ad: false });
    const [templates, setTemplates] = useState<ITemplate[]>([]);
    const [selectedTemplates, setSelectedTemplates] = useState({ greeting: '', orderConfirmation: '', ad: '' });
    const [rules, setRules] = useState<DetectionRule[]>([]);

    useEffect(() => {
        const fetchSettings = async () => {
            setFetching(true);
            try {
                const [accountRes, templatesRes] = await Promise.all([
                    fetch('/api/whatsapp/account', { cache: 'no-store' }),
                    fetch('/api/whatsapp/templates', { cache: 'no-store' }),
                ]);
                if (!accountRes.ok || !templatesRes.ok) throw new Error('Failed to load automation data.');

                const acc = (await accountRes.json()) as AccountResponse;
                const tpl = (await templatesRes.json()) as TemplatesResponse;

                setTemplates(tpl.templates ?? []);
                setSettings(acc.account.settings ?? { autoReply: false, orderConfirmation: false, ad: false });
                setRules(acc.account.detectionRules ?? []);
                setSelectedTemplates({
                    greeting: acc.account.preferredTemplates?.greeting ?? '',
                    orderConfirmation: acc.account.preferredTemplates?.orderConfirmation ?? '',
                    ad: acc.account.preferredTemplates?.ad ?? '',
                });
            } catch (err) {
                console.error(err);
                toast.error('Could not load automation settings.');
            } finally {
                setFetching(false);
            }
        };
        fetchSettings();
    }, []);

    const patchAccount = async (payload: object) => {
        try {
            setLoading(true);
            const res = await fetch('/api/whatsapp/account', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = (await res.json()) as PatchResponse;
            if (!res.ok || data.error) throw new Error(data.error || 'Update failed.');
            toast.success('Updated successfully.');
        } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : 'Update failed.');
        } finally {
            setLoading(false);
        }
    };

    // Handle toggling workflows (autoReply, orderConfirmation, ad)
    const handleSettingChange = (field: string, value: boolean) => {
        if (field === 'autoReply' && value && rules.some(r => r.active)) {
            toast.error('Cannot enable Auto Reply while some detection rules are active.');
            return;
        }
        const updated = { ...settings, [field]: value };
        setSettings(updated);
        patchAccount({ settings: updated });
    };

    const handleTemplateChange = (field: string, value: string) => {
        const updated = { ...selectedTemplates, [field]: value };
        setSelectedTemplates(updated);
        patchAccount({ preferredTemplates: updated });
    };

    // Rules management
    const updateRules = (updated: DetectionRule[]) => {
        setRules(updated);
        patchAccount({ detectionRules: updated });
    };

    const handleAddRule = (rule: DetectionRule) => updateRules([...rules, rule]);

    const handleToggleRule = (index: number, value: boolean) => {
        if (settings.autoReply && value) {
            toast.error('Cannot activate a detection rule while Auto Reply is enabled.');
            return;
        }
        const updated = rules.map((r, i) => (i === index ? { ...r, active: value } : r));
        updateRules(updated);
    };

    const handleRemoveRule = (index: number) => updateRules(rules.filter((_, i) => i !== index));

    const handleUpdateRuleKeywords = (index: number, keywords: string[]) => {
        const updated = rules.map((r, i) => (i === index ? { ...r, keywords } : r));
        updateRules(updated);
    };

    if (fetching) return <p className="text-gray-400 text-center py-8">Loading automation settings...</p>;

    return (
        <div className="space-y-8">
            {/* Add Detection Rule Button */}
            <div className="flex justify-end">
                <AddDetectionRuleModal templates={templates} autoReplyActive={settings.autoReply} onAdd={handleAddRule} />
            </div>

            {/* Unified Automation Grid */}
            <AutomationGrid
                settings={settings}
                templates={templates}
                selectedTemplates={selectedTemplates}
                loading={loading}
                rules={rules}
                rulesActive={rules.some(r => r.active)}
                onSettingChange={handleSettingChange}
                onTemplateChange={handleTemplateChange}
                onRuleToggle={handleToggleRule}
                onRuleRemove={handleRemoveRule}
                onRuleEdit={handleUpdateRuleKeywords}
                onRuleTemplateChange={(i, tplName) =>
                    updateRules(rules.map((r, j) => (j === i ? { ...r, template: tplName } : r)))
                }
            />
        </div>
    );
}
