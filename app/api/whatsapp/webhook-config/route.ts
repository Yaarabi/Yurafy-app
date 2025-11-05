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

    const globalVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN || null;

    return NextResponse.json({ globalVerifyToken });
}
