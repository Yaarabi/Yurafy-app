'use client';

import { useState, useEffect, ChangeEvent } from 'react';
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
import { ArrowRight, Crown, Zap, User, Package, MessageCircle, Globe, Palette, ChevronRight } from 'lucide-react';
import { useUserFeatures } from '@/hooks/useUserFeatures';

export default function SettingsPage() {
    const { data: featuresData, loading, error } = useUserFeatures();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('Profile');
    const [user, setUser] = useState<any>(null);
    const [whatsapp, setWhatsApp] = useState<any>(null);
    const [store, setStore] = useState<any>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Update local state when features data is loaded (ONLY on initial load)
    useEffect(() => {
        if (featuresData && !isInitialized) {
            setUser(featuresData.user);
            setWhatsApp(featuresData.features.whatsapp);
            setStore(featuresData.features.store);
            setIsInitialized(true);
        }
    }, [featuresData, isInitialized]);
    
    // NOTE: We intentionally do NOT update state from featuresData after initialization
    // to prevent overwriting user edits. State is only updated from API responses.

    // Tab icons mapping
    const tabIcons: Record<string, any> = {
        Profile: User,
        Plan: Crown,
        Store: Package,
        WhatsApp: MessageCircle,
        Language: Globe,
        Mode: Palette,
    };

    // 👇 Tabs are built dynamically (no WhatsApp/Store unless they exist)
    const tabs = [
        'Profile',
        'Plan',
        ...(store ? ['Store'] : []),
        ...(whatsapp ? ['WhatsApp'] : []),
        'Language',
        'Mode',
    ];

    // Set active tab from URL query parameter
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            // Capitalize first letter to match tab names (e.g., 'plan' -> 'Plan')
            const normalizedTab = tabParam.charAt(0).toUpperCase() + tabParam.slice(1).toLowerCase();
            
            // Recalculate tabs here to ensure they're up to date
            const availableTabs = [
                'Profile',
                'Plan',
                ...(store ? ['Store'] : []),
                ...(whatsapp ? ['WhatsApp'] : []),
                'Language',
                'Mode',
            ];
            
            // Validate that the tab exists in the available tabs
            if (availableTabs.includes(normalizedTab)) {
                setActiveTab(normalizedTab);
            }
        }
    }, [searchParams, store, whatsapp]);

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

        const updated = { ...whatsapp, [field]: value };
        setWhatsApp(updated);

        const payload: Record<string, any> = { [field]: value };
        if (field === 'settings') payload.settings = { ...whatsapp.settings, ...value };
        if (field === 'aiConfig') payload.aiConfig = { ...whatsapp.aiConfig, ...value };

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
        } else toast.error(`Failed to update ${field}.`);
        } catch (err) {
        console.error('Error updating WhatsApp account:', err);
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
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (res.ok && data.url) {
            if (activeTab === 'Profile') await updateField('logo', data.url);
            else if (activeTab === 'Store') await updateStoreField('logoUrl', data.url);
            toast.success('Logo updated successfully!');
        } else toast.error('Failed to upload logo.');
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
                <div className="mb-6 sm:mb-8 relative">
                    {/* Scrollable Tabs Container */}
                    <div className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0 scroll-smooth">
                        <div className="flex gap-2 sm:gap-3 min-w-max sm:min-w-0 sm:flex-wrap sm:justify-center">
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
                                            flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-2.5 
                                            rounded-xl sm:rounded-lg font-medium 
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
                                        <span className="font-medium">{tab}</span>
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
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 sm:hidden pointer-events-none">
                        <div className="flex gap-1 opacity-50">
                            <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse"></div>
                            <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
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
                        {activeTab === 'Profile' && (
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

                        {activeTab === 'Plan' && (
                            <div className="p-4 sm:p-6 lg:p-8">
                                <SettingsSection title="Plan">
                                    <div className="space-y-6">
                                        {/* Current Plan Display - Mobile Optimized */}
                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 sm:p-6 border border-indigo-200 dark:border-indigo-800">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
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

                                        {/* Upgrade Button - Mobile Optimized */}
                                        <div className="flex justify-center">
                                            <Link
                                                href={`/${params.locale}/onboarding/plan`}
                                                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto justify-center"
                                            >
                                                <Crown className="w-5 h-5" />
                                                <span className="text-sm sm:text-base">Upgrade Plan</span>
                                                <ArrowRight className="w-5 h-5" />
                                            </Link>
                                        </div>

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

                        {activeTab === 'Store' && store && (
                            <div className="p-4 sm:p-6 lg:p-8">
                                <StoreSettings store={store} onUpdate={updateStoreField} onUploadLogo={handleLogoUpload} locale={params.locale} />
                            </div>
                        )}

                        {activeTab === 'WhatsApp' && whatsapp && (
                            <div className="p-4 sm:p-6 lg:p-8">
                                <SettingsSection title="WhatsApp Account">
                                    <div className="space-y-4">
                                        <EditableField label="Business ID" value={whatsapp.waBusinessId || ''} onSave={(val) => updateWhatsAppField('waBusinessId', val)} />
                                        <EditableField label="Phone Number ID" value={whatsapp.waNumberId || ''} onSave={(val) => updateWhatsAppField('waNumberId', val)} />
                                        <EditableField label="Phone Number" value={whatsapp.waNumber || ''} onSave={(val) => updateWhatsAppField('waNumber', val)} />
                                        <EditableField label="Access Token" value="••••••••••••••••" onSave={(val) => updateWhatsAppField('waToken', val)} />
                                    </div>
                                </SettingsSection>
                            </div>
                        )}

                        {activeTab === 'Language' && (
                            <div className="p-4 sm:p-6 lg:p-8">
                                <SettingsSection title="Language">
                                    <LocaleSwitcher />
                                </SettingsSection>
                            </div>
                        )}

                        {activeTab === 'Mode' && (
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
