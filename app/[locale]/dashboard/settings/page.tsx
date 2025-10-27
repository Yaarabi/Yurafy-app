'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import ProfileHeader from '@/components/dashboard/setting/profileHeader';
import EditableField from '@/components/dashboard/setting/SettingsField';
import PlanSelector from '@/components/dashboard/setting/PlanSelector';
import LogoUploader from '@/components/dashboard/setting/LogoPreview';
import SettingsSection from '@/components/dashboard/setting/settingSection';
import LocaleSwitcher from '@/components/home/LocaleSwitcher';
import ThemeToggle from '@/components/dashboard/Mode';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import LogoLoader from '@/components/themePreview/loadder';

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<any>(null);
    const [whatsapp, setWhatsApp] = useState<any>(null);
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Profile');

    // 👇 Tabs are built dynamically (no WhatsApp/Store unless they exist)
    const tabs = [
        'Profile',
        'Plan',
        ...(store ? ['Store'] : []),
        ...(whatsapp ? ['WhatsApp'] : []),
        'Language',
        'Mode',
    ];

    // 👇 Fetch all user-related data once session is ready
    useEffect(() => {
        const fetchData = async () => {
        if (status === 'authenticated' && session?.user?.id) {
            try {
            const [userRes, waRes, storeRes] = await Promise.all([
                fetch(`/api/users?id=${session.user.id}`),
                fetch(`/api/whatsapp/account`),
                fetch(`/api/store/owner`),
            ]);

            const userData = await userRes.json();
            const waData = await waRes.json();
            const storeData = await storeRes.json();

            console.log(storeData)

            if (userRes.ok) setUser(userData.user);
            if (waRes.ok && waData.account) setWhatsApp(waData.account);
            if (storeRes.ok && storeData) setStore(storeData);
            } catch (err) {
            console.error('Error fetching settings:', err);
            toast.error('Failed to fetch settings.');
            } finally {
            setLoading(false);
            }
        }
        };

        fetchData();
    }, [status, session]);

    // --- Update User Field ---
    const updateField = async (field: string, value: string) => {
        if (!session?.user?.id) return;
        const updated = { ...user, [field]: value };
        setUser(updated);

        try {
        const res = await fetch(`/api/users?id=${session.user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: value }),
        });

        if (res.ok) toast.success(`${field} updated successfully!`);
        else toast.error(`Failed to update ${field}.`);
        } catch (err) {
        console.error('Error updating user:', err);
        toast.error(`Error updating ${field}.`);
        }
    };

    // --- Update WhatsApp Field ---
    const updateWhatsAppField = async (field: string, value: any) => {
        if (!session?.user?.id || !whatsapp) return;

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
            if (data?.account) setWhatsApp(data.account);
            toast.success(`${field} updated successfully!`);
        } else toast.error(`Failed to update ${field}.`);
        } catch (err) {
        console.error('Error updating WhatsApp account:', err);
        toast.error(`Error updating ${field}.`);
        }
    };

    // --- Update Store Field ---
    const updateStoreField = async (field: string, value: any) => {
        if (!store?._id) return;

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
            setStore(data);
            toast.success(`${field} updated successfully!`);
        } else toast.error(`Failed to update ${field}.`);
        } catch (err) {
        console.error('Error updating store:', err);
        toast.error(`Error updating ${field}.`);
        }
    };

    // --- Logo Upload ---
    const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

    const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;
        const file = files[0];

        if (!file.type.startsWith('image/')) return toast.error('Invalid logo type.');
        if (file.size > MAX_LOGO_SIZE) return toast.error('Logo too large (max 2MB).');

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

    const params = useParams()

    if (loading) return <LogoLoader/>
    if (!user) return <p className="text-red-500">User not found</p>;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto text-gray-800 dark:text-white mt-12">
            <ProfileHeader name={user.name} email={user.email} logo={user.logo} />

            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 mb-6 mt-6">
            {tabs.map((tab) => (
                <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-t-lg font-medium transition-all duration-200 ${
                    activeTab === tab
                    ? 'bg-[var(--brand-blue)]/20 text-[var(--brand-blue)] shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-[var(--brand-blue)]/10 hover:text-[var(--brand-blue)]'
                }`}
                >
                {tab}
                </button>
            ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-300">
            {activeTab === 'Profile' && (
                <SettingsSection title="Profile">
                <LogoUploader logoUrl={user.logo || '/logo.png'} onUpload={handleLogoUpload} />
                <EditableField label="Name" value={user.name} onSave={(val) => updateField('name', val)} />
                <EditableField label="Brand Name" value={user.brandName || ''} onSave={(val) => updateField('brandName', val)} />
                <EditableField label="Phone" value={user.phone || ''} onSave={(val) => updateField('phone', val)} />
                </SettingsSection>
            )}

            {activeTab === 'Plan' && (
                <SettingsSection title="Plan">
                <PlanSelector value={user.plan} onChange={(val) => updateField('plan', val)} />
                </SettingsSection>
            )}

            {activeTab === 'Store' && store && (
                <SettingsSection title="Store Settings">
                <LogoUploader logoUrl={'/logo.png'} onUpload={handleLogoUpload} />
                <EditableField label="Brand Name" value={store.brandName || ''} onSave={(val) => updateStoreField('brandName', val)} />
                <EditableField label="Domain" value={store.domain || ''} onSave={(val) => updateStoreField('domain', val)} />
                <EditableField label="Description" value={store.description || ''} onSave={(val) => updateStoreField('description', val)} />
                <EditableField label="Who We Are" value={store.whoWeAre || ''} onSave={(val) => updateStoreField('whoWeAre', val)} />

                <SettingsSection title="Social Links">
                    <EditableField label="Facebook" value={store.socialLinks?.facebook || ''} onSave={(val) => updateStoreField('socialLinks', { ...store.socialLinks, facebook: val })} />
                    <EditableField label="Instagram" value={store.socialLinks?.instagram || ''} onSave={(val) => updateStoreField('socialLinks', { ...store.socialLinks, instagram: val })} />
                    <EditableField label="Twitter" value={store.socialLinks?.twitter || ''} onSave={(val) => updateStoreField('socialLinks', { ...store.socialLinks, twitter: val })} />
                    <EditableField label="LinkedIn" value={store.socialLinks?.linkedin || ''} onSave={(val) => updateStoreField('socialLinks', { ...store.socialLinks, linkedin: val })} />
                </SettingsSection>

                <div className="mt-6 flex justify-end">
                    <Link
                    href={`/${params.locale}/dashboard/settings/theme`}
                    className="px-4 py-2 bg-[var(--brand-blue)] text-white rounded-lg hover:bg-[var(--brand-blue-dark)] transition-all"
                    >
                    Edit Theme
                    </Link>
                </div>
                </SettingsSection>
            )}

            {activeTab === 'WhatsApp' && whatsapp && (
                <SettingsSection title="WhatsApp Account">
                <EditableField label="Business ID" value={whatsapp.waBusinessId || ''} onSave={(val) => updateWhatsAppField('waBusinessId', val)} />
                <EditableField label="Phone Number ID" value={whatsapp.waNumberId || ''} onSave={(val) => updateWhatsAppField('waNumberId', val)} />
                <EditableField label="Phone Number" value={whatsapp.waNumber || ''} onSave={(val) => updateWhatsAppField('waNumber', val)} />
                <EditableField label="Access Token" value="••••••••••••••••" onSave={(val) => updateWhatsAppField('waToken', val)} />
                </SettingsSection>
            )}

            {activeTab === 'Language' && (
                <SettingsSection title="Language">
                <LocaleSwitcher />
                </SettingsSection>
            )}

            {activeTab === 'Mode' && (
                <SettingsSection title="Mode">
                <ThemeToggle />
                </SettingsSection>
            )}


            </div>
        </div>
        </div>
    );
}
