
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import { logger } from "@/lib/utils/logging";

/**
 * Helper function to extract locale from referer header
 */
function extractLocaleFromReferer(referer: string | null): string {
    if (!referer) return 'en';
    const localeMatch = referer.match(/\/(fr|ar)\//);
    return localeMatch ? localeMatch[1] : 'en';
}

/**
 * Helper function to build verify-email URL with locale
 */
function buildVerifyEmailUrl(baseUrl: string, locale: string, params: Record<string, string>): string {
    const path = locale === 'en' ? '/verify-email' : `/${locale}/verify-email`;
    const queryString = new URLSearchParams(params).toString();
    return `${baseUrl}${path}?${queryString}`;
}

/**
 * GET /api/auth/verify-email/[token]
 * Verify email with token
 * Supports both JSON API responses (for frontend fetch) and browser redirects (for direct link clicks)
 */
export async function GET(req: NextRequest, context: { params: any }) {
    await connectDB();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    
    // Check if this is an API request (from frontend fetch) or a browser navigation
    // When called from frontend fetch, it will have Accept: application/json header
    // When user clicks email link, they go to frontend page which then calls this API via fetch
    const acceptHeader = req.headers.get('accept') || '';
    const isApiRequest = acceptHeader.includes('application/json') || 
                        req.headers.get('x-requested-with') === 'XMLHttpRequest';
    
    // Extract locale from referer or use default
    const referer = req.headers.get('referer');
    const locale = extractLocaleFromReferer(referer);

    try {
        const params = await context.params;
        const token = params?.token;

        if (!token) {
            logger.warn("Email verification failed: missing token");
            if (isApiRequest) {
                return NextResponse.json(
                    { error: 'Missing verification token', code: 'MISSING_TOKEN', verified: false },
                    { status: 400 }
                );
            }
            const errorUrl = buildVerifyEmailUrl(baseUrl, locale, { error: 'missing_token' });
            return NextResponse.redirect(errorUrl);
        }

        const user = await User.findOne({ emailVerificationToken: token });
        if (!user) {
            logger.warn("Email verification failed: token not found", { token: token.substring(0, 10) + '...' });
            if (isApiRequest) {
                return NextResponse.json(
                    { error: 'Invalid or expired verification token', code: 'INVALID_TOKEN', verified: false },
                    { status: 400 }
                );
            }
            const errorUrl = buildVerifyEmailUrl(baseUrl, locale, { error: 'invalid_token' });
            return NextResponse.redirect(errorUrl);
        }

        // Check if email is already verified
        if (user.emailVerified) {
            if (isApiRequest) {
                return NextResponse.json(
                    { message: 'Email is already verified', verified: true },
                    { status: 200 }
                );
            }
            // Redirect to success page even if already verified
            const successUrl = buildVerifyEmailUrl(baseUrl, locale, { verified: 'true', token });
            return NextResponse.redirect(successUrl);
        }

        // Verify email
        user.emailVerified = true;
        user.emailVerificationToken = null;
        user.active = true; // Activate user after email verification
        await user.save();

        logger.info("Email verified", { email: user.email });

        if (isApiRequest) {
            // Return JSON response for API requests
            return NextResponse.json({
                message: 'Email verified successfully',
                verified: true,
                email: user.email
            });
        }

        // Redirect to success page for browser navigations with locale
        const successUrl = buildVerifyEmailUrl(baseUrl, locale, { verified: 'true', token });
        return NextResponse.redirect(successUrl);
        
    } catch (error) {
        logger.error("GET /api/auth/verify-email/[token] error", error);
        
        if (isApiRequest) {
            return NextResponse.json(
                { error: 'Server error during verification', code: 'SERVER_ERROR' },
                { status: 500 }
            );
        }
        const errorUrl = buildVerifyEmailUrl(baseUrl, locale, { error: 'server_error' });
        return NextResponse.redirect(errorUrl);
    }
}

