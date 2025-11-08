import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import { logger } from "@/lib/utils/logging";

/**
 * GET /api/auth/verify-email/[token]
 * Verify email with token
 */
export async function GET(req: NextRequest, context: { params: any }) {
    await connectDB();

    try {
        const params = await context.params;
        const token = params?.token;

        if (!token) {
            const errorUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/verify-email?error=missing_token`;
            return NextResponse.redirect(errorUrl);
        }

        const user = await User.findOne({ emailVerificationToken: token });
        if (!user) {
            // Redirect to error page
            const errorUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/verify-email?error=invalid_token`;
            return NextResponse.redirect(errorUrl);
        }

        // Verify email
        user.emailVerified = true;
        user.emailVerificationToken = null;
        user.active = true; // Activate user after email verification
        await user.save();

        logger.info("Email verified", { email: user.email });

        // Redirect to success page
        const redirectUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/verify-email?token=${token}&verified=true`;
        
        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        logger.error("GET /api/auth/verify-email/[token] error", error);
        const errorUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/verify-email?error=server_error`;
        return NextResponse.redirect(errorUrl);
    }
}

