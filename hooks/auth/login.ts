'use client';
import { signIn, getSession } from "next-auth/react";
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
            // Fetch user role directly from API to bypass NextAuth session cache timing issues
            let redirectPath = `/${params.locale}/dashboard`; // Default redirect
            
            try {
                // Retry getting session until we have user ID (max 5 attempts)
                let session = null;
                let attempts = 0;
                const maxAttempts = 5;
                
                while (attempts < maxAttempts && !session?.user?.id) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    session = await getSession();
                    if (session?.user?.id) break;
                    attempts++;
                }
                
                if (session?.user?.id) {
                    // Fetch fresh user data including role from database via API
                    const userResponse = await fetch('/api/auth/refresh', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: session.user.id }),
                    });
                    
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        console.log('User role from API:', userData.role); // Debug log
                        
                        // Check role from API response
                        if (userData.role === "admin") {
                            redirectPath = `/${params.locale}/admin`;
                        }
                    } else {
                        console.warn('API refresh failed, trying session fallback');
                        // If API fails, try session fallback
                        if (session?.user?.role === "admin") {
                            redirectPath = `/${params.locale}/admin`;
                        }
                    }
                } else {
                    // If no session ID after retries, try session role directly
                    console.warn('No session ID after retries, checking session role');
                    const finalSession = await getSession();
                    if (finalSession?.user?.role === "admin") {
                        redirectPath = `/${params.locale}/admin`;
                    }
                }
            } catch (error) {
                console.error("Error checking user role:", error);
                // On error, try session one more time
                try {
                    const errorSession = await getSession();
                    if (errorSession?.user?.role === "admin") {
                        redirectPath = `/${params.locale}/admin`;
                    }
                } catch (e) {
                    console.error("Error in fallback session check:", e);
                }
            }
            
            console.log('Redirecting to:', redirectPath); // Debug log
            // Perform redirect using window.location for hard redirect
            window.location.href = redirectPath;
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
        const phone = formData.get("phone")?.toString().trim();
        const acceptTerms = formData.get("acceptTerms")?.toString() === 'true';

        if (!username || !email || !password) {
        return "All fields are required.";
        }

        if (!acceptTerms) {
        return "You must accept the terms and conditions.";
        }

        try {
        const res = await fetch("/api/signUp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, phone, acceptTerms }),
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
