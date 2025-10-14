
import { useEffect, useState } from "react";

export default function LogsTab() {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        fetch("/api/whatsapp/messages")
        .then((res) => res.json())
        .then((data) => setMessages(data));
    }, []);

    return (
        <div className="bg-gray-700 rounded p-4 h-[70vh] overflow-y-auto space-y-4">
        {messages.length === 0 ? (
            <p className="text-gray-300 text-center">No messages yet.</p>
        ) : (
            messages.map((msg: any, idx: number) => {
            const isOutgoing = msg.direction === "outgoing";
            return (
                <div
                key={idx}
                className={`flex flex-col max-w-[80%] ${
                    isOutgoing ? "ml-auto items-end" : "items-start"
                }`}
                >
                <div
                    className={`px-4 py-2 rounded-lg ${
                    isOutgoing ? "bg-green-600" : "bg-gray-600"
                    } text-white`}
                >
                    <p className="text-sm">{msg.text}</p>
                </div>
                <span className="text-xs text-gray-400 mt-1">
                    {isOutgoing ? "You → " + msg.to : msg.from + " → You"} ·{" "}
                    {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                </div>
            );
            })
        )}
        </div>
    );
}
