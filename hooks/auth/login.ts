'use client';
import { signIn } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";

export function useSignIn() {
    const router = useRouter();
    const params = useParams();

    async function signInUser(formData: FormData) {
        const res = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
        });

        if (res?.error) return res.error as string;

        // if (res?.ok) {
        // const email = formData.get("email");
        // if (email === "admin@gmail.com") {
        return router.push(`/${params.locale}/dashboard`);
        // } else {
        //     router.push(`/${params.locale}/shop`);
        // }
        // }
    }

    return { signInUser };
    }

export function useSignUp() {
    const router = useRouter();
    const params = useParams();

    async function signUpUser(formData: FormData) {
        const name = (formData.get("name") as string).trim();
        const email = (formData.get("email") as string).trim();
        const password = (formData.get("password") as string).trim();

        try {
        const res = await fetch("/api/signUp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
            return "Registration failed. Try again.";
        } else {
            router.push(`/${params.locale}/login`);
        }
        } catch (err) {
        console.error("Registration fetch error:", err);
        return "Something went wrong. Please try again.";
        }
    }

    return { signUpUser };
    }
