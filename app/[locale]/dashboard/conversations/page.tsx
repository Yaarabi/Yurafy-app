import LogsTab from "@/components/dashboard/whatsapp/tabs/LogsTab";


export default function DashboardPage() {
    return (
        <div className="grid gap-6">
            <h2 className="text-2xl font-semibold text-white">My Conversations</h2>
            <LogsTab/>
        </div>
    );
}
