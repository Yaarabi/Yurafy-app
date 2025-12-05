"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
    const params = useParams();
    const router = useRouter();
    const locale = typeof params.locale === 'string' ? params.locale : 'en';

    useEffect(() => {
        // Use replace to avoid keeping the intermediate route in history
        router.replace(`/${locale}/onboarding/plan`);
    }, [router, locale]);

    return null;
}
