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
import { BookOpen, Bot } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const NAV_ITEMS = {
    dashboard: { href: "dashboard", icon: <MdDashboard size={20} />, key: "nav.dashboard" },
    orders: { href: "dashboard/orders", icon: <MdShoppingCart size={20} />, key: "nav.orders" },
    products: { href: "dashboard/products", icon: <MdInventory2 size={20} />, key: "nav.products" },
    customers: { href: "dashboard/customers", icon: <MdSupervisorAccount size={20} />, key: "nav.customers" },
    whatsapp: { href: "dashboard/whatsapp", icon: <MdWhatsapp size={20} />, key: "nav.whatsapp" },
    agent: { href: "dashboard/agent", icon: <Bot size={20} />, key: "nav.agent" },
    conversations: { href: "dashboard/conversations", icon: <MdMessage size={20} />, key: "nav.conversations" },
    guides: { href: "dashboard/guides", icon: <BookOpen size={20} />, key: "nav.guides" },
    settings: { href: "dashboard/settings", icon: <MdSettings size={20} />, key: "nav.settings" },
    support: { href: "dashboard/support", icon: <MdSupportAgent size={20} />, key: "nav.support" },
};

const PLAN_NAV_MAP: Record<string, (keyof typeof NAV_ITEMS)[]> = {
    "Starter": ["dashboard", "products", "orders", "customers", "guides", "settings", "support"],
    "WhatsApp Automation": ["dashboard", "orders", "customers", "conversations", "whatsapp", "guides", "settings", "support"],
    "AI WhatsApp Agent": ["dashboard", "orders", "customers", "agent", "conversations", "whatsapp", "guides", "settings", "support"],
    "Pro Seller": ["dashboard", "orders", "customers", "products", "conversations", "whatsapp", "guides", "settings", "support"],
    "Visionary": ["dashboard", "orders", "products", "customers", "agent", "conversations", "whatsapp", "guides", "settings", "support"],
    "free": ["dashboard", "products", "orders", "guides", "settings", "support"],
};

export default function SidebarNav({
    userPlan,
    pathname,
    t,
    onNavClick,
    }: {
    userPlan: string;
    pathname: string | null;
    t: any;
    onNavClick?: () => void;
    }) {
    const allowedNav = PLAN_NAV_MAP[userPlan] || PLAN_NAV_MAP["free"];
    const params = useParams();
    const router = useRouter();

    const handleNavigation = (href: string) => {
        router.push(`/${params.locale}/${href}`);
        onNavClick?.(); // Close sidebar on mobile
    };

    return (
        <nav className="flex flex-col gap-2 mt-6 overflow-y-auto">
        {allowedNav.map((key) => {
            const { href, icon, key: tKey } = NAV_ITEMS[key];
            const active = pathname?.includes(href);

            return (
            <div
                key={href}
                onClick={() => handleNavigation(href)}
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
