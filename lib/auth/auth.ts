import { connectDB } from "../db/mongoDB"; 
import User from "@/models/users";
import Plan from "@/models/plan";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            username?: string;
            email?: string;
            role?: string;
            plan?: string;
            name?: string;
            image?: string;
        };
    }

    interface User {
        id?: string;
        role?: string;
        plan?: string;
        username?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        role?: string;
        plan?: string;
        username?: string;
    }
}

async function getUserPlan(userId: string): Promise<string | null> {
    await connectDB();
    const user = await User.findById(userId);
    if (!user || !user.currentPlanId) return null;
    
    const plan = await Plan.findById(user.currentPlanId);
    if (plan && plan.status === "active") {
        return plan.planKey;
    }
    return null;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            id: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                await connectDB();

                const user = await User.findOne({ email: credentials.email.toLowerCase().trim() }).select("+password");
                if (!user) {
                    throw new Error("Invalid email or password");
                }

                // Check if email is verified
                if (!user.emailVerified) {
                    throw new Error("EMAIL_NOT_VERIFIED");
                }

                // Check if user is active
                if (!user.active) {
                    throw new Error("Account is inactive. Please verify your email.");
                }

                const isMatch = await bcrypt.compare(credentials.password, user.password);
                if (!isMatch) {
                    throw new Error("Invalid email or password");
                }

                const activePlan = await getUserPlan(user._id.toString());

                return {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    plan: activePlan || "free",
                };
            },
        }),
    ],
    pages: {
        signIn: "/en/login",
        signOut: "/en/login",
        error: "/en/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.username = user.username;
                
                // Fetch plan for user
                if (user.id) {
                    const plan = await getUserPlan(user.id);
                    token.plan = plan || "free";
                } else {
                    token.plan = user.plan || "free";
                }
            }
            
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.plan = token.plan;
                session.user.username = token.username;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
