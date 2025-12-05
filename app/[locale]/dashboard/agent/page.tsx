"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getSession } from "next-auth/react";
import ChatHeader from "@/components/dashboard/agent/ChatHeader";
import ChatMessages from "@/components/dashboard/agent/ChatMessages";
import ChatInput from "@/components/dashboard/agent/ChatInput";
import { useChatStorage, Message } from "@/hooks/chat/useStorage";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-screen max-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 overflow-hidden flex flex-col"
    >
      <ChatHeader onClear={clearChat} />
      <div className="flex-1 overflow-hidden min-h-0">
        <ChatMessages messages={messages} typing={typing} />
      </div>
      <ChatInput input={input} setInput={setInput} loading={loading} onSend={sendMessage} />
    </motion.div>
  );
}
