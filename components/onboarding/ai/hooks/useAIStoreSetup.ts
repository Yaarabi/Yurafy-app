import { useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import toast from 'react-hot-toast';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface ConfirmationData {
    message: string;
    requiresConfirmation: boolean;
}

export interface SelectedTheme {
    themeId: number;
    theme: { primaryColor: string; secondaryColor?: string; textColor?: string; surfaceColor?: string };
}

export interface SelectedThemeStructure {
    header: boolean;
    hero: boolean;
    about: boolean;
    trust: boolean;
    productGrid: boolean;
    footer: boolean;
}

export interface SelectedProductPageStructure {
    productDetails: boolean;
    productImages: boolean;
    productDescription: boolean;
    productPrice: boolean;
    productVariants: boolean;
    orderForm: boolean;
    relatedProducts: boolean;
    reviews: boolean;
}

export function useAIStoreSetup(
    plan: string,
    selectedTheme?: SelectedTheme | null,
    selectedThemeStructure?: SelectedThemeStructure | null,
    // ✅ Removed: selectedProductPageStructure - no longer needed
    onComplete?: (storeData: any) => void
) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    // ✅ FIX: Get locale from params (URL path) instead of searchParams, normalize it
    const localeRaw = String((params?.locale as string) || searchParams.get('locale') || 'en');
    const locale = localeRaw.split('/').filter(Boolean)[0] || 'en';

    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: selectedTheme && selectedThemeStructure
                ? `Hello! I'm your AI store setup assistant. I'll help you create your online store step by step. I see you've selected Theme #${selectedTheme.themeId} and configured your store structure - excellent choices! Let's start! What kind of business are you running? Tell me about your brand, products, or services.`
                : selectedTheme
                    ? `Hello! I'm your AI store setup assistant. I'll help you create your online store step by step. I see you've selected Theme #${selectedTheme.themeId} - great choice! Let's start! What kind of business are you running? Tell me about your brand, products, or services.`
                    : `Hello! I'm your AI store setup assistant. I'll help you create your online store step by step. Let's start! What kind of business are you running? Tell me about your brand, products, or services.`
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [threadId, setThreadId] = useState<string | null>(null);
    const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
    const [visibleComponents, setVisibleComponents] = useState<Record<string, boolean>>({});
    const [componentData, setComponentData] = useState<Record<string, any>>({});
    const [storeData, setStoreData] = useState<any>(null);

    // Detect if agent is asking for confirmation
    const detectConfirmationRequest = (message: string): boolean => {
        const confirmationKeywords = [
            'would you like',
            'should i',
            'confirm',
            'proceed',
            'create your store',
            'these details',
            'ready to create',
            'does this look good',
            'is this correct'
        ];
        return confirmationKeywords.some(keyword => 
            message.toLowerCase().includes(keyword.toLowerCase())
        );
    };

    const sendMessage = async (messageContent: string, isConfirmation = false) => {
        const trimmedContent = messageContent.trim();
        if (!trimmedContent || loading) return;

        if (!isConfirmation) {
            const userMessage: Message = { role: 'user', content: trimmedContent };
            setMessages(prev => [...prev, userMessage]);
            setInput('');
        }
        
        setLoading(true);
        if (!isConfirmation) {
            setConfirmationData(null); // Clear previous confirmation
        }

        try {
            const response = await fetch('/api/onboarding/ai-setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: trimmedContent,
                        plan,
                        threadId: threadId || undefined,
                        selectedTheme: selectedTheme || undefined,
                        selectedThemeStructure: selectedThemeStructure || undefined,
                        // ✅ Removed: selectedProductPageStructure - no longer needed
                    }),
            });

            const data = await response.json();

            if (data.success) {
                // Save thread ID for conversation continuity
                if (data.threadId && !threadId) {
                    setThreadId(data.threadId);
                }

                if (isConfirmation) {
                    const userMessage: Message = { role: 'user', content: trimmedContent };
                    setMessages(prev => [...prev, userMessage]);
                }

                // Only add assistant message if it's not a duplicate confirmation message
                const shouldAddMessage = !isConfirmation || !confirmationData || confirmationData.message !== data.message;
                
                if (shouldAddMessage) {
                    const assistantMessage: Message = {
                        role: 'assistant',
                        content: data.message || (isConfirmation ? 'Processing your request...' : 'I understand! Let me help you set up your store.'),
                    };
                    setMessages(prev => [...prev, assistantMessage]);
                }

                // Handle UI component actions from agent FIRST (before confirmation logic)
                // This ensures previews show even when confirmation is also requested
                if (data.uiAction) {
                    if (data.uiAction.action === 'show') {
                        setVisibleComponents(prev => ({
                            ...prev,
                            [data.uiAction.componentId]: true,
                        }));
                        if (data.uiAction.data) {
                            setComponentData(prev => ({
                                ...prev,
                                [data.uiAction.componentId]: data.uiAction.data,
                            }));
                            // Extract store data for preview components
                            if (data.uiAction.componentId === 'store_preview_edit') {
                                setStoreData(data.uiAction.data);
                            } else if (data.uiAction.componentId === 'store_preview' || data.uiAction.componentId === 'store_summary') {
                                // Store preview data for later use
                                setStoreData((prev: any) => prev || data.uiAction.data);
                            }
                        }
                    } else if (data.uiAction.action === 'hide') {
                        setVisibleComponents(prev => ({
                            ...prev,
                            [data.uiAction.componentId]: false,
                        }));
                    }
                }

                // Extract store data from response if available (prioritize this over component data)
                if (data.storeData) {
                    setStoreData(data.storeData);
                }

                // Check if agent wants to show preview with edit (when all info is collected)
                // This should take precedence over confirmation if both are present
                if (data.showPreviewEdit && data.storeData) {
                    setStoreData(data.storeData);
                    setVisibleComponents(prev => ({
                        ...prev,
                        store_preview_edit: true,
                    }));
                    // Don't show confirmation UI if preview_edit is shown (preview has its own confirmation)
                    // Clear any existing confirmation when showing edit preview
                    if (data.uiAction?.componentId === 'store_preview_edit') {
                        setConfirmationData(null);
                        setVisibleComponents(prev => ({
                            ...prev,
                            confirmation_ui: false,
                        }));
                    }
                }

                // Check if agent is asking for confirmation (fallback detection)
                // Only set if we don't already have a confirmation active AND we're not showing preview_edit
                // Preview_edit has its own save button, so we don't need separate confirmation
                const isShowingPreviewEdit = data.showPreviewEdit || data.uiAction?.componentId === 'store_preview_edit' || visibleComponents.store_preview_edit;
                
                if (!isShowingPreviewEdit && detectConfirmationRequest(data.message) && !confirmationData?.requiresConfirmation) {
                    setConfirmationData({
                        message: data.message,
                        requiresConfirmation: true,
                    });
                    // Also show confirmation UI component
                    setVisibleComponents(prev => ({
                        ...prev,
                        confirmation_ui: true,
                    }));
                }

                // Check if store was created successfully
                if (data.storeCreated) {
                    toast.success('Store created successfully!');
                    onComplete?.(data);
                    // Redirect to checkout after short delay
                    setTimeout(() => {
                        router.push(`/${locale}/onboarding/checkout?plan=${plan}`);
                    }, 2000);
                }
            } else {
                toast.error(data.error || (isConfirmation ? 'Failed to process confirmation' : 'Failed to get AI response'));
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
            if (isConfirmation) {
                setInput('');
                setConfirmationData(null);
            }
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        await sendMessage(input);
    };

    const handleConfirm = async () => {
        // If preview_edit is showing, don't show confirmation - use preview's save button instead
        if (visibleComponents.store_preview_edit) {
            // Use the preview's save functionality
            if (storeData) {
                await handleSaveAndRedirect(storeData);
            }
            return;
        }
        
        // Clear confirmation state first to prevent duplicates
        setConfirmationData(null);
        setVisibleComponents(prev => ({
            ...prev,
            confirmation_ui: false,
        }));
        const confirmationMessage = "Yes, please create the store with these details.";
        await sendMessage(confirmationMessage, true);
    };

    const handleReject = () => {
        // Clear confirmation state
        setConfirmationData(null);
        setVisibleComponents(prev => ({
            ...prev,
            confirmation_ui: false,
        }));
        // Just clear the confirmation, user can type their response
    };

    const handleEditField = (field: string, value: any) => {
        if (!storeData) return;
        
        // Handle nested fields (e.g., "hero.title", "about.description")
        const fieldParts = field.split('.');
        if (fieldParts.length === 2) {
            const [parent, child] = fieldParts;
            setStoreData((prev: any) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setStoreData((prev: any) => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const handleSaveAndRedirect = async (data: any) => {
        setSaving(true);
        try {
            // Use current storeData state (which includes any user edits)
            const currentData = data || storeData;
            
            // Transform data to match store API format
            const storePayload = {
                brandName: currentData.brandName,
                domain: currentData.domain,
                description: currentData.description,
                themeId: selectedTheme?.themeId || currentData.themeId || 1,
                theme: {
                    primaryColor: selectedTheme?.theme?.primaryColor || currentData.theme?.primaryColor || '#3B82F6',
                    secondaryColor: selectedTheme?.theme?.secondaryColor || currentData.theme?.secondaryColor,
                    textColor: selectedTheme?.theme?.textColor || currentData.theme?.textColor,
                    surfaceColor: selectedTheme?.theme?.surfaceColor || currentData.theme?.surfaceColor,
                },
                themeStructure: selectedThemeStructure || currentData.themeStructure || {
                    header: true,
                    hero: true,
                    about: true,
                    trust: true,
                    productGrid: true,
                    footer: true,
                },
                hero: {
                    title: currentData.hero?.title || '',
                    subtitle: currentData.hero?.subtitle || '',
                    imageUrl: currentData.hero?.imageUrl || '',
                },
                about: {
                    title: currentData.about?.title || '',
                    description: currentData.about?.description || '',
                },
                footer: {
                    text: currentData.footer?.text || '',
                },
                socialLinks: currentData.socialLinks || {},
                headerLinks: currentData.headerLinks || [],
            };

            // Send to store API
            const response = await fetch('/api/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(storePayload),
            });

            const responseData = await response.json();

            if (response.ok && responseData.store) {
                toast.success('Store saved successfully!');
                onComplete?.(responseData);
                // Redirect to checkout
                setTimeout(() => {
                    router.push(`/${locale}/onboarding/checkout?plan=${plan}`);
                }, 1000);
            } else {
                toast.error(responseData.error || 'Failed to save store');
            }
        } catch (error) {
            console.error('Error saving store:', error);
            toast.error('Something went wrong while saving. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return {
        messages,
        input,
        setInput,
        loading,
        saving,
        confirmationData,
        visibleComponents,
        componentData,
        storeData,
        handleSend,
        handleConfirm,
        handleReject,
        handleEditField,
        handleSaveAndRedirect,
    };
}

