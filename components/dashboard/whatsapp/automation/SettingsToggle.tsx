interface SettingsToggleProps {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
}

export default function SettingsToggle({
    label,
    value,
    onChange,
    disabled,
    }: SettingsToggleProps) {
    return (
        <div className="bg-gray-700 p-4 rounded flex items-center justify-between">
        <label className="text-white font-medium">{label}</label>
        <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
        />
        </div>
    );
}
