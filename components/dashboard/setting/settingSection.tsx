interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
    return (
        <section className="bg-gray-600 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
        <div className="space-y-4">{children}</div>
        </section>
    );
}
