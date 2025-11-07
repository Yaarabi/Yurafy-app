import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import { createErrorResponse, handleApiError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logging";
import { withRateLimit, getStrictRateLimit } from "@/lib/utils/rateLimit";
import { emailService } from "@/lib/services/emailService";
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

        // Send verification email
        try {
            await emailService.sendVerificationEmail(user.email, token, 'en');
            logger.info("Email verification requested", { email: user.email });
        } catch (error) {
            logger.error("Error sending verification email", error);
            // Don't fail the request, but log the error
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


