"use client"
import { Zap, Store, MessageCircle, Bot, Crown, Sparkles } from "lucide-react"

export const DEFAULT_PLANS = {
    free: { 
        name: "Free", 
        price: 0, 
        description: "Test all features with limited usage.",
        icon: Zap,
        color: "from-gray-400 to-gray-600",
        features: ["5 Products", "10 Orders", "Basic Support"]
    },
    starter: { 
        name: "Starter", 
        price: 11, 
        description: "Basic store setup with branding and domain.",
        icon: Store,
        color: "from-blue-400 to-blue-600",
        features: ["500 Orders", "Custom Domain", "Custom Theme", "SEO Tools"]
    },
    whatsapp: { 
        name: "WhatsApp Automation", 
        price: 11, 
        description: "Automate messaging with WhatsApp Cloud API.",
        icon: MessageCircle,
        color: "from-green-400 to-green-600",
        features: ["500 Contacts", "Auto Replies", "Templates", "Broadcasts"]
    },
    aiAgent: { 
        name: "AI WhatsApp Agent", 
        price: 21, 
        description: "Automation + AI-powered WhatsApp assistant.",
        icon: Bot,
        color: "from-purple-400 to-purple-600",
        features: ["1000 Contacts", "AI Assistant", "Smart Replies", "Multi-language"]
    },
    proSeller: { 
        name: "Pro Seller", 
        price: 25, 
        description: "Starter + WhatsApp Automation for serious sellers.",
        icon: Crown,
        color: "from-yellow-400 to-orange-600",
        features: ["1500 Orders", "Store + WhatsApp", "2000 Contacts", "Priority Support"]
    },
    visionary: { 
        name: "Visionary", 
        price: 50, 
        description: "Pro Seller + AI Agent for full power scaling.",
        icon: Sparkles,
        color: "from-indigo-400 via-purple-500 to-pink-600",
        features: ["Unlimited Orders", "All Features", "AI Agent", "Priority Support"]
    },
}

export function usePlansData() {
    return {
        plans: DEFAULT_PLANS,
        specialPlans: [],
        loading: false
    }
}
