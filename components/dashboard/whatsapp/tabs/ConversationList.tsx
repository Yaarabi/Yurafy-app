import { IWhatsAppConversation } from "@/models/whatsappMessage"; 

export default function ConversationList({
    conversations = [],
    onSelect,
    }: {
    conversations: IWhatsAppConversation[];
    onSelect: (conv: IWhatsAppConversation) => void;
    }) {
    return (
        <div className="h-full overflow-y-auto">
        {conversations.length === 0 ? (
            <p className="text-gray-300 text-center mt-6">No conversations yet.</p>
        ) : (
            conversations.map((conv) => {
            const customer = conv.customer || { phone: "Unknown" };
            const displayName = customer.name || customer.phone || "Unknown";

            return (
                <button
                key={customer.phone || conv._id}
                onClick={() => onSelect(conv)}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-600 hover:bg-gray-600"
                >
                <div className="text-left">
                    <div className="font-medium text-white">{displayName}</div>
                    <div className="text-sm text-gray-300 truncate">{conv.lastMessage}</div>
                </div>
                <div className="text-xs text-gray-400">
                    {conv.lastTimestamp ? new Date(conv.lastTimestamp).toLocaleTimeString() : ""}
                </div>
                </button>
            );
            })
        )}
        </div>
    );
}
