interface SettingsToggleProps {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
}

export default function SettingsToggle({ label, value, onChange, disabled, }: SettingsToggleProps) {
    return (
        <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <label className="text-gray-900 dark:text-white font-medium">{label}</label>

            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'} ${disabled ? 'opacity-50' : ''}`} />
                <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white dark:bg-gray-100 rounded-full shadow-sm transition-transform ${value ? 'translate-x-6' : ''}`} />
            </label>
        </div>
    );
}
