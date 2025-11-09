"use client"
import { useState, useEffect } from "react"
import { Zap, Store, MessageCircle, Bot, Crown, Sparkles } from "lucide-react"

// Icon mapping for plan templates
const iconMap: Record<string, any> = {
    zap: Zap,
    store: Store,
    messagecircle: MessageCircle,
    bot: Bot,
    crown: Crown,
    sparkles: Sparkles,
}

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

// Helper function to extract features from plan template
const extractFeatures = (features: any): string[] => {
    const featureList: string[] = []
    
    if (features.store?.enabled) {
        if (features.store.maxProducts) featureList.push(`${features.store.maxProducts} Products`)
        if (features.store.customDomain) featureList.push('Custom Domain')
        if (features.store.customTheme) featureList.push('Custom Theme')
        if (features.store.seo) featureList.push('SEO Tools')
    }
    
    if (features.whatsapp?.enabled) {
        if (features.whatsapp.maxContacts) featureList.push(`${features.whatsapp.maxContacts} Contacts`)
        if (features.whatsapp.automation) featureList.push('Auto Replies')
        if (features.whatsapp.templates) featureList.push('Templates')
        if (features.whatsapp.broadcasts) featureList.push('Broadcasts')
    }
    
    if (features.ai?.enabled) {
        if (features.ai.agent) featureList.push('AI Assistant')
        if (features.ai.contentGeneration) featureList.push('Smart Replies')
        if (features.ai.languageSupport?.length > 0) featureList.push('Multi-language')
    }
    
    if (features.orders?.enabled) {
        if (features.orders.maxOrders) featureList.push(`${features.orders.maxOrders} Orders`)
        if (features.orders.orderTracking) featureList.push('Order Tracking')
    }
    
    if (features.support?.priority) featureList.push('Priority Support')
    
    return featureList.length > 0 ? featureList : ['Basic Features']
}

export function usePlansData() {
    const [plans, setPlans] = useState(DEFAULT_PLANS)
    const [specialPlans, setSpecialPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch('/api/plans?includeSpecial=true')
                if (res.ok) {
                    const data = await res.json()
                    
                    // Convert plan templates to display format
                    const regularPlans: any = {}
                    ;(data.plans || []).forEach((template: any) => {
                        regularPlans[template.planKey] = {
                            name: template.name,
                            price: template.defaultPrice,
                            description: template.description,
                            icon: iconMap[template.icon?.toLowerCase() || 'store'] || Store,
                            color: template.color || 'from-blue-400 to-blue-600',
                            features: extractFeatures(template.features),
                        }
                    })
                    
                    const special = (data.specialPlans || []).map((template: any) => ({
                        key: template.planKey,
                        name: template.name,
                        price: template.defaultPrice,
                        description: template.description,
                        icon: iconMap[template.icon?.toLowerCase() || 'store'] || Store,
                        color: template.color || 'from-blue-400 to-blue-600',
                        features: extractFeatures(template.features),
                        isSpecial: true,
                        basePlanKey: template.basePlanKey,
                        durationDays: template.defaultDurationDays,
                    }))

                    if (Object.keys(regularPlans).length > 0) {
                        setPlans({ ...DEFAULT_PLANS, ...regularPlans })
                    }
                    setSpecialPlans(special)
                }
            } catch (err) {
                console.error('Failed to fetch plans:', err)
            } finally {
                setLoading(false)
            }
        }
        
        fetchPlans()
    }, [])

    return {
        plans,
        specialPlans,
        loading
    }
}
