export default function SidebarLogout({
    handleSignOut,
    t,
    }: {
    handleSignOut: () => void;
    t: any;
    }) {
    return (
        <div className="mt-auto">
        <button
            onClick={handleSignOut}
            className="
            w-full px-3 py-2 rounded-md font-medium transition
            bg-gray-100 text-gray-800 hover:bg-[var(--brand-blue)] hover:text-white
            dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-[var(--brand-blue)]
            "
        >
            {t("common.logout")}
        </button>
        </div>
    );
}
