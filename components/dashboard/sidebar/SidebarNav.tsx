
import { MdDashboard, MdShoppingCart, MdInventory2, MdSettings, MdSupportAgent, MdWhatsapp, MdMessage, MdSupervisorAccount } from "react-icons/md";
import { useParams, useRouter } from "next/navigation";

const NAV_ITEMS = {
    dashboard: { href: "dashboard", icon: <MdDashboard size={20} />, key: "nav.dashboard" },
    orders: { href: "dashboard/orders", icon: <MdShoppingCart size={20} />, key: "nav.orders" },
    products: { href: "dashboard/products", icon: <MdInventory2 size={20} />, key: "nav.products" },
    whatsapp: { href: "dashboard/whatsapp", icon: <MdWhatsapp size={20} />, key: "nav.whatsapp" },
    agent: { href: "dashboard/agent", icon: <MdSupervisorAccount size={20} />, key: "nav.agent" },
    conversations: { href: "dashboard/conversations", icon: <MdMessage size={20} />, key: "nav.conversations" },
    settings: { href: "dashboard/settings", icon: <MdSettings size={20} />, key: "nav.settings" },
    support: { href: "dashboard/support", icon: <MdSupportAgent size={20} />, key: "nav.support" },
};

const PLAN_NAV_MAP: Record<string, (keyof typeof NAV_ITEMS)[]> = {
    "Starter": ["dashboard", "products","orders","settings", "support"], 
    "WhatsApp Automation": ["dashboard", "orders", "whatsapp","conversations", "settings", "support"],
    "AI WhatsApp Agent": ["dashboard", "whatsapp", "agent", "conversations", "settings", "support"],
    "Creator": ["dashboard", "products", "settings", "support"],
    "Pro Seller": ["dashboard", "orders", "products", "whatsapp", "conversations", "settings", "support"],
    "Visionary": ["dashboard", "orders", "products", "whatsapp", "agent", "conversations", "settings", "support"],
    "free": ["dashboard", "settings", "support"],
};



export default function SidebarNav({ userPlan, pathname, t }: { userPlan: string ; pathname: string | null; router: any; t: any }) {
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
                className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md transition
                ${active ? "bg-indigo-600/20 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
            >
                {icon}
                <span className="font-medium truncate">{t(tKey)}</span>
            </div>
            );
        })}
        </nav>
    );
}
