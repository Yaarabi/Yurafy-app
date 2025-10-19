'use client';
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { getSession } from "next-auth/react";

interface Message {
  role: "user" | "agent";
  content: string;
}

export default function ChatWithAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Get owner ID from session
  useEffect(() => {
    const fetchOwnerId = async () => {
      const session = await getSession();
      const userId = session?.user?.id;
      if (!userId) {
        toast.error("User not authenticated");
        return;
      }
      setOwnerId(userId);
    };
    fetchOwnerId();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !ownerId) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setTyping(true);

    try {
      const res = await fetch("/api/ai-agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId, message: input }),
      });
      const data = await res.json();

      setTimeout(() => {
        if (data.reply) {
          setMessages(prev => [...prev, { role: "agent", content: data.reply }]);
        } else {
          toast.error(data.error || "No response from AI");
        }
        setTyping(false);
        setLoading(false);
      }, 600);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
      setTyping(false);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col justify-between p-6">
      <h1 className="text-2xl font-bold text-white mb-4 text-center">
        Chat with your AI Agent
      </h1>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto mb-4 p-4 rounded-lg bg-gray-800 shadow-inner flex flex-col gap-2">
        {messages.length === 0 && !typing && (
          <p className="text-gray-400 text-center mt-10">
            Start chatting with your AI Agent...
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[75%] p-3 rounded-xl break-words ${
              msg.role === "user"
                ? "bg-green-600 text-white self-end rounded-br-none"
                : "bg-gray-700 text-gray-200 self-start rounded-bl-none"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {typing && (
          <div className="max-w-[60%] p-3 rounded-xl bg-gray-700 text-gray-200 self-start rounded-bl-none animate-pulse">
            AI is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-500 transition disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
