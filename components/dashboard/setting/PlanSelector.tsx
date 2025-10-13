interface PlanSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function PlanSelector({ value, onChange }: PlanSelectorProps) {
    const plans = [ "Starter", "WhatsApp Automation", "AI WhatsApp Agent", "Creator", "Pro Seller", "Visionary", "free"];

    return (
        <div className="flex flex-col gap-1">
        <select
            className="bg-gray-700 text-gray-400 h-10 border border-gray-600 rounded px-2 py-1"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {plans.map((plan) => (
            <option key={plan} value={plan}>
                {plan}
            </option>
            ))}
        </select>
        </div>
    );
}
