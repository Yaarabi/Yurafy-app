
import { connectDB } from "../db/mongoDB"; 
import User from "@/models/users";
import type { NextAuthOptions } from "next-auth";
import credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

declare module "next-auth" {
    interface Session {
        user: {
            id?:string
            name?: string;
            email?: string;
            role?: string;
        };
    }

    interface User {
        id?:string
        role?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?:string;
        role?: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        credentials({
            name: "Credentials",
            id: "credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectDB();

                const user = await User.findOne({ email: credentials?.email }).select("+password +role");

                if (!user) return null;

                const isMatch = await bcrypt.compare(credentials!.password, user.password);
                if (!isMatch) return null;

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role, 
                };
            }
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        },
    },
};