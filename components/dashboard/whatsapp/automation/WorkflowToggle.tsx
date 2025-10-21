
interface WorkflowToggleProps {
    label: string;
    enabled: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
}

function WorkflowToggle({ label, enabled, onChange, disabled }: WorkflowToggleProps) {
    return (
        <div className="flex items-center justify-between">
        <span className="text-white font-medium">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            />
            <div
            className={`w-14 h-7 rounded-full transition-colors ${
                enabled ? "bg-green-600" : "bg-gray-600"
            }`}
            ></div>
            <div
            className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                enabled ? "translate-x-7" : ""
            }`}
            ></div>
        </label>
        </div>
    );
}

export default WorkflowToggle