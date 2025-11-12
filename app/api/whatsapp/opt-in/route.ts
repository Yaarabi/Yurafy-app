import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppConversation from "@/models/whatsappMessage";
import { normalizePhoneNumber } from "@/lib/whatsapp/phoneNormalize";

/**
 * POST /api/whatsapp/opt-in
 * Set opt-in status for a customer conversation
 * 
 * Body: { phone: string, optInStatus: "opted_in" | "opted_out" }
 */
export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure WhatsApp feature is allowed for this user
    const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
    const check = await ensureFeatureEnabled(session.user.id, 'whatsapp');
    if (check) return check;

    try {
        const { phone, optInStatus } = await req.json();

        if (!phone || !optInStatus) {
            return NextResponse.json(
                { error: "Phone and optInStatus are required" },
                { status: 400 }
            );
        }

        if (!["opted_in", "opted_out"].includes(optInStatus)) {
            return NextResponse.json(
                { error: "optInStatus must be 'opted_in' or 'opted_out'" },
                { status: 400 }
            );
        }

        // Normalize phone number to E.164 format
        const normalizedPhone = normalizePhoneNumber(phone);

        // Update or create conversation with opt-in status
        const updateData: any = {
            optInStatus,
        };

        if (optInStatus === "opted_in") {
            updateData.optInDate = new Date();
            updateData.optOutDate = null;
        } else {
            updateData.optOutDate = new Date();
            updateData.optInDate = null;
        }

        const conversation = await WhatsAppConversation.findOneAndUpdate(
            { owner: session.user.id, "customer.phone": normalizedPhone },
            {
                $set: updateData,
                $setOnInsert: {
                    owner: session.user.id,
                    customer: { phone: normalizedPhone },
                    status: "open",
                },
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            conversation: {
                phone: normalizedPhone,
                optInStatus: conversation.optInStatus,
                optInDate: conversation.optInDate,
                optOutDate: conversation.optOutDate,
            },
        });
    } catch (err: any) {
        console.error("Opt-in/opt-out error:", err);
        return NextResponse.json(
            { error: err.message || "Internal error" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/whatsapp/opt-in?phone=...
 * Get opt-in status for a customer
 */
export async function GET(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure WhatsApp feature is allowed for this user
    const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
    const check = await ensureFeatureEnabled(session.user.id, 'whatsapp');
    if (check) return check;

    try {
        const url = new URL(req.url);
        const phone = url.searchParams.get("phone");

        if (!phone) {
            return NextResponse.json(
                { error: "Phone parameter is required" },
                { status: 400 }
            );
        }

        // Normalize phone number to E.164 format
        const normalizedPhone = normalizePhoneNumber(phone);

        const conversation = await WhatsAppConversation.findOne({
            owner: session.user.id,
            "customer.phone": normalizedPhone,
        });

        return NextResponse.json({
            phone: normalizedPhone,
            optInStatus: conversation?.optInStatus || "unknown",
            optInDate: conversation?.optInDate || null,
            optOutDate: conversation?.optOutDate || null,
        });
    } catch (err: any) {
        console.error("Get opt-in status error:", err);
        return NextResponse.json(
            { error: err.message || "Internal error" },
            { status: 500 }
        );
    }
}
