interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
    return (
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-[var(--brand-blue)] rounded-full"></div>
                {title}
            </h3>
            <div className="space-y-4 sm:space-y-6">{children}</div>
        </section>
    );
}
