'use client';
import { ITemplate } from '@/models/templates';
import WorkflowToggle from './WorkflowToggle';
import TemplateSelector from './TemplateSelector';

interface WorkflowCardProps {
    label: string;
    enabled: boolean;
    templateLabel: string;
    template: string;
    templates: ITemplate[];
    disabled: boolean;
    onToggle: (value: boolean) => void;
    onTemplateChange: (value: string) => void;
}

export default function WorkflowCard({
    label,
    enabled,
    templateLabel,
    template,
    templates,
    disabled,
    onToggle,
    onTemplateChange,
}: WorkflowCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all p-5 rounded-xl shadow-md space-y-4">
            <WorkflowToggle
                label={label}
                enabled={enabled}
                onChange={onToggle}
                disabled={disabled}
            />
            <TemplateSelector
                label={templateLabel}
                templates={templates}
                selected={template}
                onChange={onTemplateChange}
            />
        </div>
    );
}
