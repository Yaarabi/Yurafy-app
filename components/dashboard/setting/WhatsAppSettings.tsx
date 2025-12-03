'use client';
import { useState } from 'react';
import { Lock, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import EditableField from './SettingsField';

interface WhatsAppSettingsProps {
    whatsapp: {
        waBusinessId?: string;
        waNumberId?: string;
        waNumber?: string;
        metaAppId?: string;
        webhookSecretEncrypted?: boolean;
        webhookVerifyToken?: string;
    };
    onUpdate: (field: string, value: any) => Promise<void>;
}

export default function WhatsAppSettings({ whatsapp, onUpdate }: WhatsAppSettingsProps) {
    const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
    const [copiedVerifyToken, setCopiedVerifyToken] = useState(false);

    const copyToClipboard = async (text: string, type: 'webhook' | 'token') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'webhook') {
                setCopiedWebhookUrl(true);
                setTimeout(() => setCopiedWebhookUrl(false), 2000);
            } else {
                setCopiedVerifyToken(true);
                setTimeout(() => setCopiedVerifyToken(false), 2000);
            }
            toast.success(`${type === 'webhook' ? 'Webhook URL' : 'Verify token'} copied to clipboard!`);
        } catch (err) {
            toast.error(`Failed to copy ${type === 'webhook' ? 'webhook URL' : 'verify token'}`);
        }
    };

    return (
        <div className="space-y-3 sm:space-y-4">
            <EditableField label="Business ID" value={whatsapp.waBusinessId || ''} onSave={(val) => onUpdate('waBusinessId', val)} />
            <EditableField label="Phone Number ID" value={whatsapp.waNumberId || ''} onSave={(val) => onUpdate('waNumberId', val)} />
            <EditableField label="Phone Number" value={whatsapp.waNumber || ''} onSave={(val) => onUpdate('waNumber', val)} />
            <EditableField label="Access Token" value="••••••••••••••••" onSave={(val) => onUpdate('waToken', val)} />
            <EditableField label="Meta App ID" value={whatsapp.metaAppId || ''} onSave={(val) => onUpdate('metaAppId', val)} />
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2 ml-1">
                Required for media templates (image, video, document). Find it in your Meta App Dashboard.
            </p>

            {/* Webhook Configuration Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Webhook Configuration
                    </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Configure webhook verification token and secret for secure webhook communication.
                </p>
                
                <EditableField 
                    label="Webhook Secret" 
                    value={whatsapp.webhookSecretEncrypted ? "••••••••••••••••" : ''} 
                    onSave={async (val) => {
                        if (val && val.trim()) {
                            await onUpdate('webhookSecret', val);
                        } else {
                            throw new Error('Enter a value to update the webhook secret, or leave empty to keep the current secret.');
                        }
                    }} 
                />

                {/* Copy to Clipboard Fields */}
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Copy these values for Meta webhook configuration:
                    </p>
                    
                    {/* Webhook URL */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Webhook URL
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/whatsapp/webhook`}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 cursor-pointer"
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                            <button
                                onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/whatsapp/webhook`, 'webhook')}
                                className="flex items-center justify-center w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                {copiedWebhookUrl ? (
                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                ) : (
                                    <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Verify Token */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Verify Token
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={whatsapp.webhookVerifyToken ? "••••••••••••••••" : 'Not generated yet'}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 cursor-pointer"
                                onClick={(e) => {
                                    if (whatsapp.webhookVerifyToken) {
                                        (e.target as HTMLInputElement).select();
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    if (whatsapp.webhookVerifyToken) {
                                        copyToClipboard(whatsapp.webhookVerifyToken, 'token');
                                    } else {
                                        toast.error('Verify token not available. Create a WhatsApp account first.');
                                    }
                                }}
                                disabled={!whatsapp.webhookVerifyToken}
                                className="flex items-center justify-center w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {copiedVerifyToken ? (
                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                ) : (
                                    <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                )}
                            </button>
                        </div>
                        {!whatsapp.webhookVerifyToken && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                Token will be generated automatically when you create your WhatsApp account
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
