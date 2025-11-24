'use client';
import { ITemplate } from '@/models/templates';
import { DetectionRule } from './types';
import DetectionRuleItem from './DetectionRuleItem';
import WorkflowCard from './WorkFlowCard';
import { JSX } from 'react';

interface AutomationGridProps {
    settings: {
        autoReply: boolean;
        ad: boolean;
    };
    templates: ITemplate[];
    selectedTemplates: {
        greeting: string;
        ad: string;
    };
    loading: boolean;
    rules: DetectionRule[];
    rulesActive: boolean;
    onSettingChange: (field: string, value: boolean) => void;
    onTemplateChange: (field: string, value: string) => void;
    onRuleToggle: (index: number, value: boolean) => void;
    onRuleRemove: (index: number) => void;
    onRuleEdit: (index: number, keywords: string[]) => void; // 🔹 updated
    onRuleTemplateChange: (index: number, templateName: string) => void;
}

export default function AutomationGrid({
    settings,
    templates,
    selectedTemplates,
    loading,
    rules,
    rulesActive,
    onSettingChange,
    onTemplateChange,
    onRuleToggle,
    onRuleRemove,
    onRuleEdit,
    onRuleTemplateChange,
}: AutomationGridProps) {
    const combinedItems: JSX.Element[] = [
        <WorkflowCard
            key="autoReply"
            label="Auto Reply"
            enabled={settings.autoReply}
            templateLabel="Greeting Template"
            template={selectedTemplates.greeting}
            templates={templates}
            disabled={loading || rulesActive}
            onToggle={v => onSettingChange('autoReply', v)}
            onTemplateChange={v => onTemplateChange('greeting', v)}
        />,
        <WorkflowCard
            key="ad"
            label="Ad Template"
            enabled={settings.ad}
            templateLabel="Ad Template"
            template={selectedTemplates.ad}
            templates={templates}
            disabled={loading}
            onToggle={v => onSettingChange('ad', v)}
            onTemplateChange={v => onTemplateChange('ad', v)}
        />,
        ...rules.map((rule, idx) => (
            <div
                key={idx}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all p-5 rounded-xl shadow-md space-y-3"
            >
                <DetectionRuleItem
                    index={idx}
                    rule={rule}
                    templates={templates}
                    autoReplyActive={settings.autoReply}
                    onToggle={onRuleToggle}
                    onRemove={() => onRuleRemove(idx)}
                    onEdit={onRuleEdit} // 🔹 now supports keywords update
                    onTemplateChange={onRuleTemplateChange}
                />
            </div>
        )),
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            {combinedItems}
        </div>
    );
}
