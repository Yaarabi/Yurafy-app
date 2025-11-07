
import WhatsAppDashboard from "@/components/dashboard/whatsapp/chats/WhatsAppDashboard";


export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-4">My Conversations</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 sm:p-4">
                <WhatsAppDashboard />
            </div>
        </div>
    );
}
