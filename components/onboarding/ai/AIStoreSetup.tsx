'use client';

import { useAIStoreSetup } from './hooks/useAIStoreSetup';
import ChatHeader from './components/ChatHeader';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import StorePreview from './components/StorePreview';
import StoreSummary from './components/StoreSummary';
import StorePreviewWithEdit from './components/StorePreviewWithEdit';

interface SelectedTheme {
    themeId: number;
    theme: { primaryColor: string; secondaryColor?: string; textColor?: string; surfaceColor?: string };
}

interface SelectedThemeStructure {
    header: boolean;
    hero: boolean;
    about: boolean;
    trust: boolean;
    productGrid: boolean;
    footer: boolean;
}

interface SelectedProductPageStructure {
    productDetails: boolean;
    productImages: boolean;
    productDescription: boolean;
    productPrice: boolean;
    productVariants: boolean;
    orderForm: boolean;
    relatedProducts: boolean;
    reviews: boolean;
}

export default function AIStoreSetup({ 
    plan, 
    selectedTheme,
    selectedThemeStructure,
    // ✅ Removed: selectedProductPageStructure - no longer needed
    onComplete 
}: { 
    plan: string;
    selectedTheme?: SelectedTheme | null;
    selectedThemeStructure?: SelectedThemeStructure | null;
    // ✅ Removed: selectedProductPageStructure - no longer needed
    onComplete: (storeData: any) => void;
}) {
    const {
        messages,
        input,
        setInput,
        loading,
        confirmationData,
        visibleComponents,
        componentData,
        storeData,
        handleSend,
        handleConfirm,
        handleReject,
        handleEditField,
        handleSaveAndRedirect,
        saving,
    } = useAIStoreSetup(plan, selectedTheme, selectedThemeStructure, onComplete);

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            <ChatHeader />

            <ChatMessages 
                messages={messages} 
                loading={loading}
                confirmationData={visibleComponents.store_preview_edit ? null : confirmationData} // Don't show confirmation if preview_edit is visible
                onConfirm={handleConfirm}
                onReject={handleReject}
            />

            {/* Store Preview Component - Show during collection */}
            <StorePreview
                data={componentData.store_preview || storeData || null}
                visible={(visibleComponents.store_preview || false) && !visibleComponents.store_preview_edit}
            />

            {/* Store Summary Component - Show before final preview */}
            <StoreSummary
                data={componentData.store_summary || storeData || null}
                visible={(visibleComponents.store_summary || false) && !visibleComponents.store_preview_edit}
            />

            {/* Store Preview with Edit - Show when all info is collected (takes precedence) */}
            <StorePreviewWithEdit
                data={storeData || componentData.store_preview_edit || componentData.store_preview || null}
                visible={visibleComponents.store_preview_edit || false}
                onSave={handleSaveAndRedirect}
                onEdit={handleEditField}
                loading={saving}
            />


            <ChatInput
                input={input}
                setInput={setInput}
                onSend={handleSend}
                loading={loading}
                confirmationData={confirmationData}
            />
        </div>
    );
}

