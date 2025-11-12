"use client";

import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileHeader from '@/components/dashboard/setting/profileHeader';
import EditableField from '@/components/dashboard/setting/SettingsField';
import LogoUploader from '@/components/dashboard/setting/LogoPreview';
import SettingsSection from '@/components/dashboard/setting/settingSection';
import LocaleSwitcher from '@/components/home/LocaleSwitcher';
import ThemeToggle from '@/components/dashboard/Mode';
import Link from 'next/link';
import StoreSettings from '@/components/dashboard/setting/StoreSettings';
import { useParams, useSearchParams } from 'next/navigation';
import LogoLoader from '@/components/themePreview/loadder';
import { ArrowRight, Crown, Zap, User, Package, MessageCircle, Globe, Palette, ChevronRight, Lock, Copy, Check } from 'lucide-react';
import { useUserFeatures } from '@/hooks/useUserFeatures';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
    const { data: featuresData, loading, error } = useUserFeatures();
    const searchParams = useSearchParams();
    const t = useTranslations('settings');
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState<any>(null);
    const [whatsapp, setWhatsApp] = useState<any>(null);
    const [store, setStore] = useState<any>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
    const [copiedVerifyToken, setCopiedVerifyToken] = useState(false);
    
         // Update local state when features data is loaded (ONLY on initial load)
     useEffect(() => {
         if (featuresData && !isInitialized) {
             setUser(featuresData.user);
             setWhatsApp(featuresData.features.whatsapp);
             setStore(featuresData.features.store);
             setIsInitialized(true);
         }
         // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [featuresData?.user?.id, featuresData?.features?.store?._id, featuresData?.features?.whatsapp?._id, isInitialized]); // Only depend on IDs to prevent unnecessary re-runs


    
    // NOTE: We intentionally do NOT update state from featuresData after initialization
    // to prevent overwriting user edits. State is only updated from API responses.

    // Tab icons mapping
    const tabIcons: Record<string, any> = {
        profile: User,
        plan: Crown,
        store: Package,
        whatsapp: MessageCircle,
        language: Globe,
        mode: Palette,
    };

    // 👇 Tabs are built dynamically (no WhatsApp/Store unless they exist)
    // Memoize tabs array to prevent unnecessary re-renders
    const tabs = useMemo(() => [
        'profile',
        'plan',
        ...(store ? ['store'] : []),
        ...(whatsapp ? ['whatsapp'] : []),
        'language',
        'mode',
    ], [store?._id, whatsapp?._id]); // Only recalculate when store/whatsapp IDs change

    // Set active tab from URL query parameter (only once on mount or when tab param changes)
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            const normalizedTab = tabParam.toLowerCase();

            // Recalculate available tabs in lowercase
            const availableTabs = [
                'profile',
                'plan',
                ...(store ? ['store'] : []),
                ...(whatsapp ? ['whatsapp'] : []),
                'language',
                'mode',
            ];

            if (availableTabs.includes(normalizedTab) && activeTab !== normalizedTab) {
                setActiveTab(normalizedTab);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, store?._id, whatsapp?._id]); // Only react to searchParams and IDs, not full objects to prevent loops



    // --- Update User Field ---
    const updateField = async (field: string, value: string) => {
        if (!user) return;
        
        // Optimistically update UI
        const fieldToUpdate = field === 'name' ? 'username' : field;
        const updated = { ...user, [fieldToUpdate]: value };
        setUser(updated);

        try {
            const res = await fetch('/api/user/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value }),
            });

            if (res.ok) {
                const updatedData = await res.json();
                // Update user state with the response data, preserving all fields
                // Use nullish coalescing to preserve empty strings but use fallback for undefined/null
                const updatedUser = {
                    ...user,
                    ...updatedData,
                    // Ensure all fields are preserved
                    id: updatedData.id ?? user.id,
                    username: updatedData.username ?? user.username,
                    email: updatedData.email ?? user.email,
                    phone: updatedData.phone ?? user.phone ?? '',
                    logo: updatedData.logo ?? user.logo ?? '',
                    role: updatedData.role ?? user.role,
                    plan: updatedData.plan ?? user.plan,
                    active: updatedData.active ?? user.active,
                    onboardingCompleted: updatedData.onboardingCompleted ?? user.onboardingCompleted,
                };
                setUser(updatedUser);
                toast.success(`${field === 'name' ? 'Name' : field} updated successfully!`);
            } else {
                // Revert optimistic update on error
                setUser(user);
                const errorData = await res.json();
                toast.error(errorData.error || `Failed to update ${field === 'name' ? 'name' : field}.`);
            }
        } catch (err) {
            // Revert optimistic update on error
            setUser(user);
            console.error('Error updating user:', err);
            toast.error(`Error updating ${field === 'name' ? 'name' : field}.`);
        }
    };

        // --- Update WhatsApp Field ---
    const updateWhatsAppField = async (field: string, value: any) => {        
        if (!whatsapp) return;

        const originalWhatsApp = { ...whatsapp };
        const updated = { ...whatsapp, [field]: value };
        setWhatsApp(updated);

        const payload: Record<string, any> = {};
        
                 // Handle special fields
         if (field === 'webhookSecret') {
             // webhookSecret needs special handling - only send if value is provided
             payload.webhookSecret = value;
         } else if (field === 'settings') {
            payload.settings = { ...whatsapp.settings, ...value };
        } else if (field === 'aiConfig') {
            payload.aiConfig = { ...whatsapp.aiConfig, ...value };
        } else {
            payload[field] = value;
        }

        try {
        const res = await fetch(`/api/whatsapp/account`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            const data = await res.json();
            if (data?.account) {
                setWhatsApp(data.account);
                toast.success(`${field} updated successfully!`);
            } else {
                toast.success(`${field} updated successfully!`);
            }
                  } else {
              setWhatsApp(originalWhatsApp);
              const errorData = await res.json();
              toast.error(errorData.error || `Failed to update ${field}.`);
          }
        } catch (err) {
            setWhatsApp(originalWhatsApp);
            console.error('Error updating WhatsApp:', err);
            toast.error(`Error updating ${field}.`);
        }
    };

    // --- Update Store Field ---
    const updateStoreField = async (field: string, value: any) => {
        if (!store?._id) return;

        // Optimistically update UI
        const updated = { ...store, [field]: value };
        setStore(updated);

        try {
        const res = await fetch(`/api/store`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storeId: store._id, updates: { [field]: value } }),
        });

        if (res.ok) {
            const data = await res.json();
            // API returns { store: serialized }, so extract the store object
            const updatedStore = data.store || data;
            // Merge with existing store to preserve all fields
            // Deep merge nested objects to preserve all fields
            const mergedStore = {
                ...store,
                ...updatedStore,
                // Deep merge nested objects to preserve all existing fields
                hero: updatedStore.hero ? { ...store.hero, ...updatedStore.hero } : (store.hero || {}),
                about: updatedStore.about ? { ...store.about, ...updatedStore.about } : (store.about || {}),
                footer: updatedStore.footer ? { ...store.footer, ...updatedStore.footer } : (store.footer || {}),
                socialLinks: updatedStore.socialLinks ? { ...store.socialLinks, ...updatedStore.socialLinks } : (store.socialLinks || {}),
                theme: updatedStore.theme ? { ...store.theme, ...updatedStore.theme } : (store.theme || {}),
            };
            setStore(mergedStore);
            toast.success(`${field} updated successfully!`);
        } else {
            // Revert optimistic update on error
            setStore(store);
            const errorData = await res.json();
            toast.error(errorData.error || `Failed to update ${field}.`);
        }
        } catch (err) {
        // Revert optimistic update on error
        setStore(store);
        console.error('Error updating store:', err);
        toast.error(`Error updating ${field}.`);
        }
    };

    // --- Logo Upload ---
    const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

    const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const files = e.target.files;
        if (!files?.length) return;
        const file = files[0];

        if (!file.type.startsWith('image/')) { toast.error('Invalid logo type.'); return; }
        if (file.size > MAX_LOGO_SIZE) { toast.error('Logo too large (max 2MB).'); return; }

        try {
            const { uploadFile } = await import('@/lib/utils/upload');
            const result = await uploadFile(file);

            if (result.success) {
                if (activeTab === 'profile') await updateField('logo', result.data.url);
                else if (activeTab === 'store') await updateStoreField('logoUrl', result.data.url);
                toast.success('Logo updated successfully!');
            } else {
                toast.error(result.error.message || 'Failed to upload logo.');
            }
        } catch (err) {
            console.error('Error uploading logo:', err);
            toast.error('Error uploading logo.');
        }
    };



    const params = useParams();

    if (loading) return <LogoLoader/>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!user) return <p className="text-red-500">User not found</p>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Profile Header - Mobile Optimized */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 sm:mb-8"
                >
                    <ProfileHeader name={user.username} email={user.email} logo={user.logo} />
                </motion.div>

                {/* Tabs Navigation - Mobile Scrollable with Smart UX */}
                {/* Tabs Navigation - Mobile: fixed bottom bar, Desktop: centered nav */}
                <div className="mb-6 sm:mb-8 relative">
                    <div className="fixed bottom-0 left-0 right-0 z-40 sm:static sm:z-auto bg-white dark:bg-gray-900 border-t sm:border-0 border-gray-200 dark:border-gray-700 p-2 sm:p-0">
                        {/* Scrollable Tabs Container */}
                        <div className="overflow-x-auto scrollbar-hide sm:-mx-4 sm:mx-0 sm:px-0 px-2 scroll-smooth">
                            <div className="flex gap-2 sm:gap-3 min-w-max sm:min-w-0 sm:flex-wrap sm:justify-center items-center">
                                {tabs.map((tab, index) => {
                                    const Icon = tabIcons[tab];
                                    const isActive = activeTab === tab;
                                    return (
                                        <motion.button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`
                                                flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 
                                                rounded-full sm:rounded-lg font-medium 
                                                transition-all duration-200 whitespace-nowrap
                                                text-sm sm:text-base
                                                relative
                                                ${
                                                    isActive
                                                        ? 'bg-[var(--brand-blue)] text-white shadow-lg shadow-[var(--brand-blue)]/50 ring-2 ring-[var(--brand-blue)]/30 dark:ring-[var(--brand-blue)]/50'
                                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[var(--brand-blue)]/10 dark:hover:bg-[var(--brand-blue)]/20 hover:text-[var(--brand-blue)] dark:hover:text-[var(--brand-blue)] border border-gray-200 dark:border-gray-700 hover:border-[var(--brand-blue)]/30 dark:hover:border-[var(--brand-blue)]/50'
                                                }
                                            `}
                                        >
                                            {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
                                            <span className="font-medium">{t(`tabs.${tab}`)}</span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTabIndicator"
                                                    className="absolute bottom-0 left-0 right-0 h-1 bg-white/50 rounded-full hidden sm:block"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile Scroll Indicator */}
                        <div className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <div className="flex gap-1 opacity-50">
                                <div className="w-1 h-1 rounded-full bg-[var(--brand-blue)] animate-pulse"></div>
                                <div className="w-1 h-1 rounded-full bg-[var(--brand-blue)] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-1 h-1 rounded-full bg-[var(--brand-blue)] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                    {/* add spacing so content isn't hidden behind the fixed mobile bar */}
                    <div className="h-14 sm:hidden" />
                </div>

                {/* Tab Content - Animated */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        {activeTab === 'profile' && (
                            <div className="p-4 sm:p-6 lg:p-8">
                                <SettingsSection title="Profile">
                                    <div className="space-y-6">
                                        <LogoUploader logoUrl={user.logo || '/logo.png'} onUpload={handleLogoUpload} />
                                        <div className="space-y-4">
                                            <EditableField label="Name" value={user.username} onSave={(val) => updateField('name', val)} />
                                            <EditableField label="Phone" value={user.phone || ''} onSave={(val) => updateField('phone', val)} />
                                        </div>
                                    </div>
                                </SettingsSection>
                            </div>
                        )}

                        {activeTab === 'plan' && (
                            <div className="p-4 sm:p-6 lg:p-8">
                                <SettingsSection title="Plan">
                                    <div className="space-y-6">
                                        {/* Current Plan Display - Mobile Optimized */}
                                        <div className="bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-xl p-4 sm:p-6 border border-[var(--brand-blue)]/30 dark:border-[var(--brand-blue)]/40">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                <div className="p-3 bg-[var(--brand-blue)] rounded-xl shadow-lg flex-shrink-0">
                                                    {(featuresData?.plan?.planKey || user.plan || 'free').toLowerCase() === 'free' ? (
                                                        <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                                    ) : (
                                                        <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                                        Current Plan: {featuresData?.plan?.planKey || user.plan || 'Free'}
                                                    </h3>
                                                    {featuresData?.plan?.currentPlan && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {featuresData.plan.currentPlan.endDate 
                                                                ? `Expires: ${new Date(featuresData.plan.currentPlan.endDate).toLocaleDateString()}`
                                                                : ''
                                                            }
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                                                        {(featuresData?.plan?.planKey || user.plan || 'free').toLowerCase() === 'free'
                                                            ? 'You are on the free plan. Upgrade to unlock more features!'
                                                            : 'Manage your subscription and explore upgrade options.'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Upgrade/Renew Button - Mobile Optimized */}
                                        {/* Only show upgrade button if not Visionary plan */}
                                        {featuresData?.plan?.planKey?.toLowerCase() !== 'visionary' && (
                                            <div className="flex justify-center">
                                                <Link
                                                    href={`/${params.locale}/onboarding/upgrade`}
                                                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[var(--brand-blue)] text-white font-semibold rounded-xl hover:bg-[var(--brand-blue)]/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto justify-center"
                                                >
                                                    <Crown className="w-5 h-5" />
                                                    <span className="text-sm sm:text-base">Upgrade Plan</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        )}
                                        {/* Show renew button if expired, even for Visionary */}
                                        {featuresData?.plan?.isExpired && featuresData?.plan?.planKey?.toLowerCase() === 'visionary' && (
                                            <div className="flex justify-center">
                                                <Link
                                                    href={`/${params.locale}/onboarding/upgrade`}
                                                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[var(--brand-blue)] text-white font-semibold rounded-xl hover:bg-[var(--brand-blue)]/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto justify-center"
                                                >
                                                    <Crown className="w-5 h-5" />
                                                    <span className="text-sm sm:text-base">Renew Plan</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        )}

                                        {/* Plan Features Info */}
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                                                Click "Upgrade Plan" to view all available plans and choose the one that best fits your needs.
                                            </p>
                                        </div>
                                    </div>
                                </SettingsSection>
                            </div>
                        )}

                        {activeTab === 'store' && store && (
                            <div className="p-4 sm:p-6 lg:p-8">
                                <StoreSettings store={store} onUpdate={updateStoreField} onUploadLogo={handleLogoUpload} locale={params.locale} />
                            </div>
                        )}

                        {activeTab === 'whatsapp' && whatsapp && (
                            <div className="p-4 sm:p-6 lg:p-8">
                                <SettingsSection title="WhatsApp Account">
                                    <div className="space-y-4">
                                        <EditableField label="Business ID" value={whatsapp.waBusinessId || ''} onSave={(val) => updateWhatsAppField('waBusinessId', val)} />
                                        <EditableField label="Phone Number ID" value={whatsapp.waNumberId || ''} onSave={(val) => updateWhatsAppField('waNumberId', val)} />
                                        <EditableField label="Phone Number" value={whatsapp.waNumber || ''} onSave={(val) => updateWhatsAppField('waNumber', val)} />
                                        <EditableField label="Access Token" value="••••••••••••••••" onSave={(val) => updateWhatsAppField('waToken', val)} />

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
                                                These are used to verify incoming webhook requests from Meta.
                                            </p>
                                            
                                            <EditableField 
                                                label="Webhook Secret" 
                                                value={whatsapp.webhookSecretEncrypted ? "••••••••••••••••" : ''} 
                                                onSave={async (val) => {
                                                    // Only send webhookSecret if a value is provided (to avoid clearing existing secret)
                                                    if (val && val.trim()) {
                                                        await updateWhatsAppField('webhookSecret', val);
                                                    } else {
                                                        // If empty, don't update (keep existing secret) - throw to prevent save
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
                                                            onClick={async () => {
                                                                const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/whatsapp/webhook`;
                                                                try {
                                                                    await navigator.clipboard.writeText(webhookUrl);
                                                                    setCopiedWebhookUrl(true);
                                                                    toast.success('Webhook URL copied to clipboard!');
                                                                    setTimeout(() => setCopiedWebhookUrl(false), 2000);
                                                                } catch (err) {
                                                                    toast.error('Failed to copy webhook URL');
                                                                }
                                                            }}
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

                                                                                                 {/* Verify Token - User's generated token */}
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
                                                             onClick={async () => {
                                                                 const verifyToken = whatsapp.webhookVerifyToken || '';
                                                                 if (!verifyToken) {
                                                                     toast.error('Verify token not available. Create a WhatsApp account first.');
                                                                     return;
                                                                 }
                                                                 try {
                                                                     await navigator.clipboard.writeText(verifyToken);
                                                                     setCopiedVerifyToken(true);
                                                                     toast.success('Verify token copied to clipboard!');
                                                                     setTimeout(() => setCopiedVerifyToken(false), 2000);
                                                                 } catch (err) {
                                                                     toast.error('Failed to copy verify token');
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
                                </SettingsSection>
                            </div>
                        )}

                        {activeTab === 'language' && (
                            <div className="p-4 sm:p-6 lg:p-8">
                                <SettingsSection title="Language">
                                    <LocaleSwitcher />
                                </SettingsSection>
                            </div>
                        )}

                        {activeTab === 'mode' && (
                            <div className="p-4 sm:p-6 lg:p-8">
                                <SettingsSection title="Mode">
                                    <ThemeToggle />
                                </SettingsSection>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
