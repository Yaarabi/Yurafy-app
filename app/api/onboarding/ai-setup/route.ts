import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import { generateStoreSetupResponse, getThreadId } from "@/lib/agent/storeAgent/storeAgent";

/**
 * AI-powered store setup assistant
 * Uses LangGraph agent with tools to help users set up their store
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { message, plan, threadId } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        await connectDB();

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Use provided thread ID or generate one for conversation continuity
        const conversationThreadId = threadId || getThreadId(session.user.id);

        // Generate AI response using the store agent
        const response = await generateStoreSetupResponse(
            session.user.id,
            message,
            plan,
            conversationThreadId
        );

        return NextResponse.json({
            success: true,
            message: response,
            threadId: conversationThreadId,
        });

    } catch (error) {
        console.error("AI setup error:", error);
        return NextResponse.json(
            { error: "Failed to process AI setup request" },
            { status: 500 }
        );
    }
}

/**
 * Note: Store creation is now handled by the save_store tool in the agent
 * This endpoint is kept for backward compatibility but the agent will handle it directly
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Delegate to the store API route
        const { storeData } = await request.json();

        if (!storeData || !storeData.brandName || !storeData.domain) {
            return NextResponse.json({ error: "Brand name and domain are required" }, { status: 400 });
        }

        // Call the store API route
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                owner: session.user.id,
                ...storeData,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.error || "Failed to create store" }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            store: data,
            message: "Store created successfully!",
        });

    } catch (error) {
        console.error("Store creation error:", error);
        return NextResponse.json(
            { error: "Failed to create store" },
            { status: 500 }
        );
    }
}
