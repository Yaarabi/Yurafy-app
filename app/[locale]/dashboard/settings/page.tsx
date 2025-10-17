'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast'; // ✅ Import toast
import ProfileHeader from '@/components/dashboard/setting/profileHeader';
import EditableField from '@/components/dashboard/setting/SettingsField';
import PlanSelector from '@/components/dashboard/setting/PlanSelector';
import LogoUploader from '@/components/dashboard/setting/LogoPreview';
import SettingsSection from '@/components/dashboard/setting/settingSection';
import LocaleSwitcher from '@/components/home/LocaleSwitcher';

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<any>(null);
    const [whatsapp, setWhatsApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Profile');

    const tabs = ['Profile', 'Plan', 'WhatsApp', 'Language'];

    // Fetch user + WhatsApp account
    useEffect(() => {
        const fetchData = async () => {
        if (status === 'authenticated' && session?.user?.id) {
            try {
            const [userRes, waRes] = await Promise.all([
                fetch(`/api/users?id=${session.user.id}`),
                fetch(`/api/whatsapp/account`)
            ]);

            const userData = await userRes.json();
            const waData = await waRes.json();

            if (userRes.ok) setUser(userData.user);
            if (waRes.ok) setWhatsApp(waData.account);
            } catch (err) {
            console.error('Error fetching data:', err);
            toast.error('Failed to fetch settings.');
            } finally {
            setLoading(false);
            }
        }
        };
        fetchData();
    }, [status, session]);

    // Update user field
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

        if (res.ok) {
            toast.success(`${field} updated successfully!`);
        } else {
            const errorText = await res.text();
            console.error('Error updating user:', errorText);
            toast.error(`Failed to update ${field}.`);
        }
        } catch (err) {
        console.error('Error updating user:', err);
        toast.error(`Error updating ${field}.`);
        }
    };

    // Update WhatsApp field
// Update WhatsApp field safely
    const updateWhatsAppField = async (field: string, value: any) => {
        if (!session?.user?.id || !whatsapp) return;

        // Update local state first
        const updated = { ...whatsapp, [field]: value };
        setWhatsApp(updated);

        // Prepare payload
        const payload: Record<string, any> = { [field]: value };

        // If updating settings or aiConfig, merge the full object
        if (field === "settings") payload.settings = { ...whatsapp.settings, ...value };
        if (field === "aiConfig") payload.aiConfig = { ...whatsapp.aiConfig, ...value };

        try {
            const res = await fetch(`/api/whatsapp/account`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                if (data?.account) setWhatsApp(data.account);
                toast.success(`${field} updated successfully!`);
            } else {
                const text = await res.text();
                console.error("Failed to update WhatsApp field:", text);
                toast.error(`Failed to update ${field}.`);
            }
        } catch (err) {
            console.error("Error updating WhatsApp account:", err);
            toast.error(`Error updating ${field}.`);
        }
    };



    // Convert file to base64
    const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        });

    // Handle logo upload
    const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (!file.type.startsWith('image/')) {
        toast.error('Invalid file type.');
        return;
        }
        if (file.size > 2 * 1024 * 1024) {
        toast.error('File too large. Max 2MB.');
        return;
        }

        try {
        const base64Logo = await toBase64(file);
        await updateField('logo', base64Logo);
        toast.success('Logo updated successfully!');
        } catch (err) {
        console.error('Error uploading logo:', err);
        toast.error('Error uploading logo.');
        }
    };

    if (loading) return <p className="text-gray-400 animate-pulse">Loading settings...</p>;
    if (!user) return <p className="text-red-500">User not found</p>;

    return (
        <div className="max-w-5xl mx-auto p-6 text-gray-800 dark:text-white">
        <ProfileHeader name={user.name} email={user.email} logo={user.logo} />

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 mt-6">
            {tabs.map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 w-32 rounded text-sm font-medium transition-all
                ${activeTab === tab
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-500 hover:text-white'}`}
            >
                {tab}
            </button>
            ))}
        </div>

        {/* Active Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-300">
            {activeTab === 'Profile' && (
            <SettingsSection title="Profile">
                <LogoUploader logoUrl={user.logo || '/default.png'} onUpload={handleLogoUpload} />
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
        </div>
        </div>
    );
}
