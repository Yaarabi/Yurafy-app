interface PlanSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function PlanSelector({ value, onChange }: PlanSelectorProps) {
    const plans = ['free', 'store', 'insta bot', 'whatsapp bot', 'Pro'];

    return (
        <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Plan</label>
        <select
            className="border rounded px-2 py-1"
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
