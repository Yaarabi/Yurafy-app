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
    const [loading, setLoading] = useState(true);

    // Fetch user info
    useEffect(() => {
        const fetchUser = async () => {
        if (status === 'authenticated' && session?.user?.id) {
            const res = await fetch(`/api/users?id=${session.user.id}`);
            const data = await res.json();
            if (res.ok) setUser(data.user);
            setLoading(false);
        }
        };
        fetchUser();
    }, [status, session]);

    // Update field and persist to backend
    const updateField = async (field: string, value: string) => {
        if (!session?.user?.id) return;

        const updated = { ...user, [field]: value };
        setUser(updated); // optimistic update

        try {
        const res = await fetch(`/api/users?id=${session.user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: value }),
        });
        if (!res.ok) {
            console.error('Failed to update user');
        }
        } catch (err) {
        console.error('Error updating user:', err);
        }
    };

    // Helper: convert file to base64
    const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        });

    // Handle logo upload with validation
    const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        // Validate file type
        if (!file.type.startsWith('image/')) {
        alert('Invalid file type. Please upload an image.');
        return;
        }

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
        alert('File too large. Max size is 2MB.');
        return;
        }

        try {
        const base64Logo = await toBase64(file);

        // Optimistically update UI
        updateField('logo', base64Logo);

        // Persist to backend
        if (session?.user?.id) {
            const res = await fetch(`/api/users?id=${session.user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logo: base64Logo }),
            });

            if (!res.ok) {
            alert('Failed to upload logo');
            }
        }
        } catch (err) {
        console.error('Error uploading logo:', err);
        }
    };

    if (loading) return <p className="text-gray-400">Loading user...</p>;
    if (!user) return <p className="text-red-500">User not found</p>;

    return (
        <div className="max-w-[80%] mx-auto px-4 py-6 space-y-6">
        <ProfileHeader name={user.name} email={user.email} logo={user.logo} />

        <SettingsSection title="Profile">
            <EditableField label="Name" value={user.name} onSave={(val) => updateField('name', val)} />
            <EditableField
            label="Brand Name"
            value={user.brandName.toLowerCase() || ''}
            onSave={(val) => updateField('brandName', val)}
            />
            <EditableField
            label="Phone"
            value={user.phone || ''}
            onSave={(val) => updateField('phone', val)}
            />
        </SettingsSection>

        <SettingsSection title="Plan">
            <PlanSelector value={user.plan} onChange={(val) => updateField('plan', val)} />
        </SettingsSection>

        <SettingsSection title="Logo">
            {/* Pass input handler instead of file */}
            <LogoUploader logoUrl={user.logo || '/default.png'} onUpload={handleLogoUpload} />
        </SettingsSection>
        <SettingsSection title='Language'>
            <LocaleSwitcher/>
        </SettingsSection>
        </div>
    );
}
