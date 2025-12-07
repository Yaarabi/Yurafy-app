'use client';
import { useState } from 'react';
import EditableField from './SettingsField';
import { Lock, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface ProfileSettingsProps {
    user: { username: string; phone?: string };
    onUpdate: (field: string, value: string) => Promise<void>;
}

export default function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
    const t = useTranslations('settings');
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) return t('password.errors.minLength');
        if (!/[A-Z]/.test(password)) return t('password.errors.uppercase');
        if (!/[a-z]/.test(password)) return t('password.errors.lowercase');
        if (!/[0-9]/.test(password)) return t('password.errors.number');
        return null;
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordForm.currentPassword) {
            toast.error(t('password.errors.currentRequired'));
            return;
        }
        if (!passwordForm.newPassword) {
            toast.error(t('password.errors.newRequired'));
            return;
        }
        const error = validatePassword(passwordForm.newPassword);
        if (error) {
            toast.error(error);
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error(t('password.errors.mismatch'));
            return;
        }
        if (passwordForm.currentPassword === passwordForm.newPassword) {
            toast.error(t('password.errors.same'));
            return;
        }
        setIsLoadingPassword(true);
        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || t('password.errors.failed'));
            }
            toast.success(t('password.success'));
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordSection(false);
        } catch (err: any) {
            toast.error(err.message || t('password.errors.failed'));
        } finally {
            setIsLoadingPassword(false);
        }
    };

    return (
        <div className="space-y-3 sm:space-y-6">
            {/* Profile Fields */}
            <div className="space-y-3 sm:space-y-4">
                <EditableField label="Name" value={user.username} onSave={(val) => onUpdate('name', val)} />
                <EditableField label="Phone" value={user.phone || ''} onSave={(val) => onUpdate('phone', val)} />
            </div>

            {/* Password Change Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <button
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors w-full sm:w-auto"
                >
                    <Lock className="w-4 h-4" />
                    {showPasswordSection ? t('password.hide') : t('password.change')}
                </button>

                {showPasswordSection && (
                    <form onSubmit={handlePasswordChange} className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('password.current')} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                    placeholder="Enter current password"
                                    disabled={isLoadingPassword}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('password.new')} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                    placeholder="Enter new password"
                                    disabled={isLoadingPassword}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {t('password.hint')}
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('password.confirm')} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                    placeholder="Confirm new password"
                                    disabled={isLoadingPassword}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={isLoadingPassword}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {isLoadingPassword ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t('password.updating')}
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        {t('password.update')}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPasswordSection(false);
                                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                {t('password.cancel')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
