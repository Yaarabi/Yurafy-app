import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import { createErrorResponse, handleApiError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logging";
import { withRateLimit, getStrictRateLimit } from "@/lib/utils/rateLimit";
import crypto from "crypto";

/**
 * POST /api/auth/verify-email
 * Request email verification
 */
export const POST = withRateLimit(async (req: NextRequest) => {
    await connectDB();

    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return createErrorResponse("Email is required", 400, "MISSING_EMAIL");
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal if user exists for security
            return NextResponse.json({ message: "If the email exists, a verification link has been sent" });
        }

        if (user.emailVerified) {
            return NextResponse.json({ message: "Email is already verified" });
        }

        // Generate verification token
        const token = crypto.randomBytes(32).toString("hex");
        user.emailVerificationToken = token;
        await user.save();

        // Send verification email (in production, use proper email service)
        const verificationUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/verify-email/${token}`;
        
        logger.info("Email verification requested", { email: user.email });

        // TODO: Implement actual email sending with nodemailer or service like SendGrid
        // For now, log the token in development
        if (process.env.NODE_ENV === "development") {
            logger.info("Verification token (dev only)", { token, url: verificationUrl });
        }

        return NextResponse.json({ 
            message: "Verification email sent",
            // Only return token in development
            ...(process.env.NODE_ENV === "development" ? { token } : {}),
        });
    } catch (error) {
        logger.error("POST /api/auth/verify-email error", error);
        return handleApiError(error);
    }
}, getStrictRateLimit());

/**
 * GET /api/auth/verify-email/[token]
 * Verify email with token
 */
export async function GET(req: NextRequest) {
    await connectDB();

    try {
        const url = new URL(req.url);
        const token = url.pathname.split("/").pop();

        if (!token) {
            return createErrorResponse("Verification token is required", 400, "MISSING_TOKEN");
        }

        const user = await User.findOne({ emailVerificationToken: token });
        if (!user) {
            return createErrorResponse("Invalid or expired verification token", 400, "INVALID_TOKEN");
        }

        // Verify email
        user.emailVerified = true;
        user.emailVerificationToken = null;
        user.active = true; // Activate user after email verification
        await user.save();

        logger.info("Email verified", { email: user.email });

        // Redirect to success page
        const redirectUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/login?verified=true`;
        
        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        logger.error("GET /api/auth/verify-email error", error);
        return handleApiError(error);
    }
}

