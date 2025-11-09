"use client"
import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import toast from "react-hot-toast"

const planTypes = {
    FREE: ['free'],
    WHATSAPP_ONLY: ['whatsapp', 'aiAgent'],
    STORE_ONLY: ['starter'],
    MIXED: ['proSeller', 'visionary']
}

export function usePlanSelection(isUpgrade: boolean) {
    const router = useRouter()
    const params = useParams()
    const [loading, setLoading] = useState<string | null>(null)

    const handlePlanSelect = async (planKey: string) => {
        setLoading(planKey)

        try {
            const localeRaw = String(params.locale || 'en')
            const locale = localeRaw.split('/').filter(Boolean)[0] || 'en'
            
            // Free plan → redirect to info page to create store
            if (planTypes.FREE.includes(planKey)) {
                router.push(`/${locale}/onboarding/info?plan=${planKey}`)
                return
            }

            // If this is an upgrade (user has completed onboarding), use upgrade API
            if (isUpgrade) {
                const response = await fetch('/api/upgrade', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planKey, locale }),
                })

                if (!response.ok) {
                    const error = await response.json()
                    toast.error(error.error || 'Failed to process upgrade')
                    setLoading(null)
                    return
                }

                const result = await response.json()
                
                if (result.created && result.created.length > 0) {
                    toast.success(
                        `Created: ${result.created.join(', ')}. Redirecting...`,
                        { duration: 2000 }
                    )
                }

                setTimeout(() => {
                    router.push(`${result.redirectTo}`)
                }, 500)
                return
            }

            // First-time onboarding flow
            // WhatsApp-only plans → redirect directly to checkout
            if (planTypes.WHATSAPP_ONLY.includes(planKey)) {
                router.push(`/${locale}/onboarding/checkout?plan=${planKey}`)
                return
            }

            // Store-only plans → redirect to onboarding/info to create store first
            if (planTypes.STORE_ONLY.includes(planKey)) {
                router.push(`/${locale}/onboarding/info?plan=${planKey}`)
                return
            }

            // Mixed plans (Store + WhatsApp) → redirect to info page to create store first
            if (planTypes.MIXED.includes(planKey)) {
                router.push(`/${locale}/onboarding/info?plan=${planKey}`)
                return
            }
        } catch (error) {
            console.error('Error selecting plan:', error)
            toast.error('Something went wrong. Please try again.')
            setLoading(null)
        }
    }

    return {
        loading,
        handlePlanSelect
    }
}
