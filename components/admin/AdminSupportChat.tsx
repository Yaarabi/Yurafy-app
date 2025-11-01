"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Bot, User, X, Loader2, Users, Search } from "lucide-react";
import toast from "react-hot-toast";

interface Conversation {
    userId: string;
    user?: {
        username?: string;
        email?: string;
    };
    count: number;
    lastMessage?: {
        text?: string;
        createdAt?: string;
        role?: string;
    };
}

interface Message {
    _id?: string;
    role: "user" | "bot";
    text: string;
    createdAt?: string;
}

export default function AdminSupportChat() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchUserMessages(selectedUser);
        } else {
            setMessages([]);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/support");
            if (!response.ok) throw new Error("Failed to fetch conversations");
            
            const data = await response.json();
            setConversations(data.conversations || []);
        } catch (error) {
            console.error("Error fetching conversations:", error);
            toast.error("Failed to load conversations");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserMessages = async (userId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/support/messages?userId=${userId}`);
            if (!response.ok) throw new Error("Failed to fetch messages");
            
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    const sendReply = async () => {
        if (!input.trim() || !selectedUser || sending) return;

        const adminMessage: Message = {
            role: "bot",
            text: input.trim(),
        };

        setMessages((prev) => [...prev, adminMessage]);
        setInput("");
        setSending(true);

        try {
            const response = await fetch("/api/admin/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ownerId: selectedUser,
                    text: adminMessage.text,
                }),
            });

            if (!response.ok) throw new Error("Failed to send message");

            // Create notification for user
            try {
                await fetch("/api/notifications/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ownerId: selectedUser,
                        type: "support_reply",
                        title: "Support Reply",
                        message: adminMessage.text.substring(0, 100),
                        link: "/dashboard/support",
                    }),
                });
            } catch (notifError) {
                console.error("Error creating notification:", notifError);
            }

            toast.success("Reply sent!");
            fetchConversations(); // Refresh conversations to update last message
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
            setMessages((prev) => prev.slice(0, -1));
        } finally {
            setSending(false);
        }
    };

    const filteredConversations = conversations.filter((conv) => {
        const username = conv.user?.username || '';
        const email = conv.user?.email || '';
        return username.toLowerCase().includes(searchTerm.toLowerCase()) ||
               email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const selectedConversation = conversations.find((c) => c.userId === selectedUser);

    return (
        <div className="flex flex-col sm:flex-row h-[calc(100vh-200px)] min-h-[600px] gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Conversations List */}
            <div className="w-full sm:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-900">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Conversations</h3>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading && conversations.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No conversations found</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <motion.button
                                key={conv.userId}
                                onClick={() => setSelectedUser(conv.userId)}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`w-full p-4 text-left border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                                    selectedUser === conv.userId
                                        ? "bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600"
                                        : ""
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                                            {conv.user?.username || 'Unknown User'}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                            {conv.user?.email || 'No email'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-1">
                                            {conv.lastMessage?.text || "No messages"}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        <span className="text-xs text-gray-500 dark:text-gray-500">
                                            {conv.count}
                                        </span>
                                    </div>
                                </div>
                            </motion.button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">{selectedConversation?.user?.username || 'Unknown User'}</h3>
                                    <p className="text-xs text-indigo-100">{selectedConversation?.user?.email || 'No email'}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={chatRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400">No messages yet</p>
                                </div>
                            ) : (
                                messages.map((message, index) => (
                                    <motion.div
                                        key={message._id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${message.role === "user" ? "justify-start" : "justify-end"}`}
                                    >
                                        <div
                                            className={`flex items-start gap-2 max-w-[75%] ${
                                                message.role === "user" ? "flex-row" : "flex-row-reverse"
                                            }`}
                                        >
                                            <div
                                                className={`p-2 rounded-full ${
                                                    message.role === "user"
                                                        ? "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                        : "bg-indigo-500 text-white"
                                                }`}
                                            >
                                                {message.role === "user" ? (
                                                    <User className="w-4 h-4" />
                                                ) : (
                                                    <Bot className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div
                                                className={`px-4 py-2 rounded-2xl ${
                                                    message.role === "user"
                                                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-tl-none"
                                                        : "bg-indigo-600 text-white rounded-tr-none"
                                                }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap break-words">
                                                    {message.text}
                                                </p>
                                                {message.createdAt && (
                                                    <p
                                                        className={`text-xs mt-1 ${
                                                            message.role === "user"
                                                                ? "text-gray-500 dark:text-gray-400"
                                                                : "text-indigo-100"
                                                        }`}
                                                    >
                                                        {new Date(message.createdAt).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendReply()}
                                    placeholder="Type your reply..."
                                    disabled={sending}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
                                />
                                <button
                                    onClick={sendReply}
                                    disabled={!input.trim() || sending}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {sending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    <span>Send</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center p-8">
                        <div>
                            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-2">Select a conversation</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                Choose a user from the list to start replying
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

