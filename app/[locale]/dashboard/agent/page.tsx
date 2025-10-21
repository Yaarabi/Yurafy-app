'use client';
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getSession } from "next-auth/react";
import ChatHeader from "@/components/dashboard/agent/ChatHeader";
import ChatMessages from "@/components/dashboard/agent/ChatMessages";
import ChatInput from "@/components/dashboard/agent/ChatInput";
import { useChatStorage, Message } from "@/hooks/chat/useStorage"; 

export default function ChatWithAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);

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

  useChatStorage(ownerId, messages, setMessages);

  const sendMessage = async () => {
    if (!input.trim() || !ownerId) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
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
          setMessages((prev) => [
            ...prev,
            { role: "agent", content: data.reply },
          ]);
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

  const clearChat = () => {
    if (!ownerId) return;
    localStorage.removeItem(`chat_${ownerId}`);
    setMessages([]);
    toast.success("Chat cleared!");
  };

  return (
    <div className="bg-gray-900 h-screen flex flex-col justify-between p-3 sm:p-6 max-w-full mx-auto">
      <ChatHeader onClear={clearChat} />
      <ChatMessages messages={messages} typing={typing} />
      <ChatInput input={input} setInput={setInput} loading={loading} onSend={sendMessage} />
    </div>
  );
}
