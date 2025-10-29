"use client"
import { redirect } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function RootPage() {
    

    const params = useParams()
    redirect(`/${params.locale}/onboarding/plan`);
}
