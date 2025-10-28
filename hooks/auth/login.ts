'use client';
import { signIn } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";

export function useSignIn() {
    const router = useRouter();
    const params = useParams();

    async function signInUser(formData: FormData): Promise<string | void> {
        const email = formData.get("email")?.toString().trim();
        const password = formData.get("password")?.toString().trim();

        if (!email || !password) return "Email and password are required.";

        const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        });

        if (res?.error) return res.error;

        if (res?.ok) {
        router.push(`/${params.locale}/dashboard`);
        }
    }

    return { signInUser };
}

export function useSignUp() {
    const router = useRouter();
    const params = useParams();

    async function signUpUser(formData: FormData): Promise<string | true> {
        const username = formData.get("username")?.toString().trim();
        const email = formData.get("email")?.toString().trim().toLowerCase();
        const password = formData.get("password")?.toString().trim();

        if (!username || !email || !password) {
        return "All fields are required.";
        }

        try {
        const res = await fetch("/api/signUp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
            return data.error || "Registration failed. Try again.";
        }

        router.push(`/${params.locale}/login`);
        return true;
        } catch (err) {
        console.error("Registration fetch error:", err);
        return "Something went wrong. Please try again.";
        }
    }

    return { signUpUser };
}
