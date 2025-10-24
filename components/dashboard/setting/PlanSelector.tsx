interface PlanSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function PlanSelector({ value, onChange }: PlanSelectorProps) {
    const plans = [ "Starter", "WhatsApp Automation", "AI WhatsApp Agent", "Creator", "Pro Seller", "Visionary", "free"];

    return (
        <div className="flex flex-col gap-1">
        <select
            className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 h-10 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-blue"
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
