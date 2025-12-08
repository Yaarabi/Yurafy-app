
import { ITemplate } from '@/models/automation/templates';

export interface DetectionRule {
    keywords: string[];
    template: string;
    active: boolean;
    date?: Date | null;
    addFlag?: boolean;
    autoScanFlag?: boolean;
}

export interface Settings {
    autoReply: boolean;
    orderConfirmation: boolean;
    ad: boolean;
}

export interface AccountResponse {
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

export interface TemplatesResponse {
    templates: ITemplate[];
}

export interface PatchResponse {
    success?: boolean;
    error?: string;
}
