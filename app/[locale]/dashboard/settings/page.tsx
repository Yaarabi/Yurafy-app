'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
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
        await fetch(`/api/users?id=${session.user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: value }),
        });
        } catch (err) {
        console.error('Error updating user:', err);
        }
    };

    // Update WhatsApp field
    const updateWhatsAppField = async (field: string, value: string) => {
        if (!session?.user?.id) return;
        const updated = { ...whatsapp, [field]: value };
        setWhatsApp(updated);

        try {
        const res = await fetch(`/api/whatsapp/account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: value }),
        });

        if (res.ok) {
            const data = await res.json();
            setWhatsApp(data.account);
        }
        } catch (err) {
        console.error('Error updating WhatsApp account:', err);
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
        if (!file.type.startsWith('image/')) return alert('Invalid file type.');
        if (file.size > 2 * 1024 * 1024) return alert('File too large.');

        try {
        const base64Logo = await toBase64(file);
        updateField('logo', base64Logo);
        } catch (err) {
        console.error('Error uploading logo:', err);
        }
    };

    if (loading) return <p className="text-gray-400">Loading settings...</p>;
    if (!user) return <p className="text-red-500">User not found</p>;

    return (
        <div className="max-w-[80%] mx-auto px-4 py-6 space-y-6">
        <ProfileHeader name={user.name} email={user.email} logo={user.logo} />

        <SettingsSection title="Profile">
            <EditableField label="Name" value={user.name} onSave={(val) => updateField('name', val)} />
            <EditableField label="Brand Name" value={user.brandName || ''} onSave={(val) => updateField('brandName', val)} />
            <EditableField label="Phone" value={user.phone || ''} onSave={(val) => updateField('phone', val)} />
        </SettingsSection>

        <SettingsSection title="Plan">
            <PlanSelector value={user.plan} onChange={(val) => updateField('plan', val)} />
        </SettingsSection>

        <SettingsSection title="Logo">
            <LogoUploader logoUrl={user.logo || '/default.png'} onUpload={handleLogoUpload} />
        </SettingsSection>

        {whatsapp && (
            <SettingsSection title="WhatsApp Account">
            <EditableField label="Business ID" value={whatsapp.waBusinessId || ''} onSave={(val) => updateWhatsAppField('waBusinessId', val)} />
            <EditableField label="Phone Number" value={whatsapp.waNumber || ''} onSave={(val) => updateWhatsAppField('waNumber', val)} />
            <EditableField label="Access Token" value="••••••••••••••••" onSave={(val) => updateWhatsAppField('waToken', val)} />
            </SettingsSection>
        )}

        <SettingsSection title="Language">
            <LocaleSwitcher />
        </SettingsSection>
        </div>
    );
}
