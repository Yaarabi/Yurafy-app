import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { requireFeature } from "@/lib/auth/planAccess";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ hasAccess: false, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const feature = searchParams.get("feature");

        if (!feature) {
            return NextResponse.json({ hasAccess: false, error: "Feature parameter required" }, { status: 400 });
        }

        const result = await requireFeature(session.user.id, feature);

        return NextResponse.json({
            hasAccess: result.allowed,
            error: result.error,
            daysRemaining: result.planStatus?.daysRemaining || null,
            planKey: result.planStatus?.planKey || null,
        });

    } catch (error) {
        console.error("Plan access check error:", error);
        return NextResponse.json(
            { hasAccess: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

