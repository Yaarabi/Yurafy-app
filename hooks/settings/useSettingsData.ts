import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import toast from 'react-hot-toast';

export function useSettingsData(featuresData: any) {
    const [user, setUser] = useState<any>(null);
    const [whatsapp, setWhatsApp] = useState<any>(null);
    const [store, setStore] = useState<any>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (featuresData && !isInitialized) {
            setUser(featuresData.user);
            setWhatsApp(featuresData.features.whatsapp);
            setStore(featuresData.features.store);
            setIsInitialized(true);
        }
    }, [featuresData?.user?.id, featuresData?.features?.store?._id, featuresData?.features?.whatsapp?._id, isInitialized]);

    const updateField = useCallback(async (field: string, value: string) => {
        if (!user) return;
        
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
                const updatedUser = {
                    ...user,
                    ...updatedData,
                    id: updatedData.id ?? user.id,
                    username: updatedData.username ?? user.username,
                    email: updatedData.email ?? user.email,
                    phone: updatedData.phone ?? user.phone ?? '',
                    role: updatedData.role ?? user.role,
                    plan: updatedData.plan ?? user.plan,
                    active: updatedData.active ?? user.active,
                    onboardingCompleted: updatedData.onboardingCompleted ?? user.onboardingCompleted,
                };
                setUser(updatedUser);
                toast.success(`${field === 'name' ? 'Name' : field} updated successfully!`);
            } else {
                setUser(user);
                const errorData = await res.json();
                toast.error(errorData.error || `Failed to update ${field === 'name' ? 'name' : field}.`);
            }
        } catch (err) {
            setUser(user);
            console.error('Error updating user:', err);
            toast.error(`Error updating ${field === 'name' ? 'name' : field}.`);
        }
    }, [user]);

    const updateWhatsAppField = useCallback(async (field: string, value: any) => {
        if (!whatsapp) return;

        const originalWhatsApp = { ...whatsapp };
        const updated = { ...whatsapp, [field]: value };
        setWhatsApp(updated);

        const payload: Record<string, any> = {};
        
        if (field === 'webhookSecret') {
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
    }, [whatsapp]);

    const updateStoreField = useCallback(async (field: string, value: any) => {
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
                const updatedStore = data.store || data;
                const mergedStore = {
                    ...store,
                    ...updatedStore,
                    hero: updatedStore.hero ? { ...store.hero, ...updatedStore.hero } : (store.hero || {}),
                    about: updatedStore.about ? { ...store.about, ...updatedStore.about } : (store.about || {}),
                    footer: updatedStore.footer ? { ...store.footer, ...updatedStore.footer } : (store.footer || {}),
                    socialLinks: updatedStore.socialLinks ? { ...store.socialLinks, ...updatedStore.socialLinks } : (store.socialLinks || {}),
                    theme: updatedStore.theme ? { ...store.theme, ...updatedStore.theme } : (store.theme || {}),
                };
                setStore(mergedStore);
                toast.success(`${field} updated successfully!`);
            } else {
                setStore(store);
                const errorData = await res.json();
                toast.error(errorData.error || `Failed to update ${field}.`);
            }
        } catch (err) {
            setStore(store);
            console.error('Error updating store:', err);
            toast.error(`Error updating ${field}.`);
        }
    }, [store]);

    const handleLogoUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>, activeTab: string): Promise<void> => {
        const files = e.target.files;
        if (!files?.length) return;
        const file = files[0];

        if (!file.type.startsWith('image/')) { toast.error('Invalid logo type.'); return; }
        if (file.size > 2 * 1024 * 1024) { toast.error('Logo too large (max 2MB).'); return; }

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
    }, [updateField, updateStoreField]);

    return {
        user,
        whatsapp,
        store,
        updateField,
        updateWhatsAppField,
        updateStoreField,
        handleLogoUpload
    };
}
