'use client';
import { useEffect } from "react";

export interface Message {
    role: "user" | "agent";
    content: string;
}

const EXPIRATION_DAYS = 7;

export function useChatStorage(
    ownerId: string | null,
    messages: Message[],
    setMessages: (m: Message[]) => void
    ) {
    // Load from storage
    useEffect(() => {
        if (!ownerId) return;
        const stored = localStorage.getItem(`chat_${ownerId}`);
        if (stored) {
        const data = JSON.parse(stored);
        const { messages, timestamp } = data;

        const expired = Date.now() - timestamp > EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
        if (expired) {
            localStorage.removeItem(`chat_${ownerId}`);
            return;
        }
        setMessages(messages);
        }
    }, [ownerId, setMessages]);

    // Save to storage
    useEffect(() => {
        if (!ownerId) return;
        localStorage.setItem(
        `chat_${ownerId}`,
        JSON.stringify({
            messages,
            timestamp: Date.now(),
        })
        );
    }, [messages, ownerId]);
}
