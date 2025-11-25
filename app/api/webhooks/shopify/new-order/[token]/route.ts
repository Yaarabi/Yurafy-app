import { NextRequest, NextResponse } from "next/server";

// Dummy helper: find user by webhook token
async function findUserByWebhookToken(token: string): Promise<string | null> {
    // Replace with real DB lookup
    if (token === "valid-token") return "user-id-123";
    return null;
}

// Dummy helper: save order to DB
async function saveOrderToDB(userId: string, order: any): Promise<void> {
    // Replace with real DB save logic
    console.log("Saving order for user:", userId, order);
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
    const token = params.token;
    if (!token) {
        return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const userId = await findUserByWebhookToken(token);
    if (!userId) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    await saveOrderToDB(userId, body);

    return NextResponse.json({ success: true });
}
