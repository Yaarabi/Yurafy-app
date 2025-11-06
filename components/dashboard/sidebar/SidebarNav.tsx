import {
    MdDashboard,
    MdShoppingCart,
    MdInventory2,
    MdSettings,
    MdSupportAgent,
    MdWhatsapp,
    MdMessage,
    MdSupervisorAccount,
} from "react-icons/md";
import { useParams, useRouter } from "next/navigation";

const NAV_ITEMS = {
    dashboard: { href: "dashboard", icon: <MdDashboard size={20} />, key: "nav.dashboard" },
    orders: { href: "dashboard/orders", icon: <MdShoppingCart size={20} />, key: "nav.orders" },
    products: { href: "dashboard/products", icon: <MdInventory2 size={20} />, key: "nav.products" },
    customers: { href: "dashboard/customers", icon: <MdSupervisorAccount size={20} />, key: "nav.customers" },
    whatsapp: { href: "dashboard/whatsapp", icon: <MdWhatsapp size={20} />, key: "nav.whatsapp" },
    agent: { href: "dashboard/agent", icon: <MdSupervisorAccount size={20} />, key: "nav.agent" },
    conversations: { href: "dashboard/conversations", icon: <MdMessage size={20} />, key: "nav.conversations" },
    settings: { href: "dashboard/settings", icon: <MdSettings size={20} />, key: "nav.settings" },
    support: { href: "dashboard/support", icon: <MdSupportAgent size={20} />, key: "nav.support" },
};

const PLAN_NAV_MAP: Record<string, (keyof typeof NAV_ITEMS)[]> = {
    "Starter": ["dashboard", "products", "orders", "customers", "settings", "support"],
    "WhatsApp Automation": ["dashboard", "orders", "customers", "conversations", "whatsapp", "settings", "support"],
    "AI WhatsApp Agent": ["dashboard", "orders", "customers", "agent", "conversations", "whatsapp", "settings", "support"],
    "Pro Seller": ["dashboard", "orders", "customers", "products", "conversations", "whatsapp", "settings", "support"],
    "Visionary": ["dashboard", "orders", "products", "customers", "agent", "conversations", "whatsapp", "settings", "support"],
    "free": ["dashboard", "products", "orders", "settings", "support"],
};

export default function SidebarNav({
    userPlan,
    pathname,
    t,
    }: {
    userPlan: string;
    pathname: string | null;
    t: any;
    }) {
    const allowedNav = PLAN_NAV_MAP[userPlan] || PLAN_NAV_MAP["free"];
    const params = useParams();
    const router = useRouter();

    return (
        <nav className="flex flex-col gap-2 mt-6 overflow-y-auto">
        {allowedNav.map((key) => {
            const { href, icon, key: tKey } = NAV_ITEMS[key];
            const active = pathname?.includes(href);

            return (
            <div
                key={href}
                onClick={() => router.push(`/${params.locale}/${href}`)}
                className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-150
                ${
                    active
                    ? "bg-[var(--brand-blue)]/20 text-[var(--brand-blue)] font-semibold"
                    : "text-gray-800 dark:text-gray-200 hover:bg-[var(--brand-blue)]/10 hover:text-[var(--brand-blue)] dark:hover:bg-[var(--brand-blue)]/10"
                }`}
            >
                {icon}
                <span className="font-medium truncate">{t(tKey)}</span>
            </div>
            );
        })}
        </nav>
    );
}
