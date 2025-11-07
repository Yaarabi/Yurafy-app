import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import { createErrorResponse, handleApiError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logging";
import { withRateLimit, getStrictRateLimit } from "@/lib/utils/rateLimit";
import { validatePassword } from "@/lib/utils/validation";
import { emailService } from "@/lib/services/emailService";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * POST /api/auth/reset-password/request
 * Request password reset
 */
export async function POST(req: NextRequest) {
    await connectDB();

    try {
        const body = await req.json();
        const { email, token, newPassword } = body;

        // Request password reset
        if (email && !token && !newPassword) {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                // Don't reveal if user exists for security
                return NextResponse.json({ 
                    message: "If the email exists, a password reset link has been sent" 
                });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString("hex");
            user.passwordResetToken = resetToken;
            user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
            await user.save();

            // Send reset email
            try {
                await emailService.sendPasswordResetEmail(user.email, resetToken, 'en');
                logger.info("Password reset requested", { email: user.email });
            } catch (error) {
                logger.error("Error sending password reset email", error);
                // Don't fail the request, but log the error
            }

            return NextResponse.json({ 
                message: "Password reset email sent",
                // Only return token in development
                ...(process.env.NODE_ENV === "development" ? { token: resetToken } : {}),
            });
        }

        // Reset password with token
        if (token && newPassword) {
            if (!newPassword || newPassword.length < 8) {
                return createErrorResponse(
                    "Password must be at least 8 characters long",
                    400,
                    "WEAK_PASSWORD"
                );
            }

            // Validate password strength
            const validation = validatePassword(newPassword);
            if (!validation.valid) {
                return createErrorResponse(
                    validation.errors.join(", "),
                    400,
                    "WEAK_PASSWORD"
                );
            }

            const user = await User.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: new Date() },
            });

            if (!user) {
                return createErrorResponse(
                    "Invalid or expired reset token",
                    400,
                    "INVALID_TOKEN"
                );
            }

            // Update password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            user.passwordResetToken = null;
            user.passwordResetExpires = null;
            await user.save();

            logger.info("Password reset successful", { email: user.email });

            return NextResponse.json({ 
                message: "Password reset successful" 
            });
        }

        return createErrorResponse(
            "Either email or token + newPassword is required",
            400,
            "MISSING_FIELDS"
        );
    } catch (error) {
        logger.error("POST /api/auth/reset-password error", error);
        return handleApiError(error);
    }
}

