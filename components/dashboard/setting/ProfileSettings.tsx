'use client';
import EditableField from './SettingsField';

interface ProfileSettingsProps {
    user: { username: string; phone?: string };
    onUpdate: (field: string, value: string) => Promise<void>;
}

export default function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
    return (
        <div className="space-y-3 sm:space-y-4">
            <EditableField label="Name" value={user.username} onSave={(val) => onUpdate('name', val)} />
            <EditableField label="Phone" value={user.phone || ''} onSave={(val) => onUpdate('phone', val)} />
        </div>
    );
}
