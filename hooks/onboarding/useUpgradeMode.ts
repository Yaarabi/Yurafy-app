"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export function useUpgradeMode() {
    const { data: session, status } = useSession()
    const [isUpgrade, setIsUpgrade] = useState(false)

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: session.user.id }),
            })
                .then(async (res) => {
                    if (res.ok) {
                        const data = await res.json()
                        setIsUpgrade(data.onboardingCompleted === true)
                    }
                })
                .catch(() => {
                    setIsUpgrade(false)
                })
        }
    }, [status, session])

    return isUpgrade
}
