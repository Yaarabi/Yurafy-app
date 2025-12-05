import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

/**
 * GET: Returns the global WHATSAPP_VERIFY_TOKEN from .env
 * This allows users to easily copy the token for Meta webhook configuration
 */
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Make sure the user has whatsapp feature enabled
    const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
    const check = await ensureFeatureEnabled(session.user.id, 'whatsapp');
    if (check) return check;

    const globalVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN || null;

    return NextResponse.json({ globalVerifyToken }, {
        headers: {
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
    });
}
