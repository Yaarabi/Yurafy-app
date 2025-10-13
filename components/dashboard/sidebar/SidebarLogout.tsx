
export default function SidebarLogout({ handleSignOut, t }: { handleSignOut: () => void; t: any }) {
    return (
        <div className="mt-auto">
        <button
            onClick={handleSignOut}
            className="w-full px-3 py-2 rounded-md bg-gray-800 hover:bg-red-600 text-gray-200 font-medium transition"
        >
            {t("common.logout")}
        </button>
        </div>
    );
}
