import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import Store from "@/models/store";
import { generateStoreSetupResponse, getThreadId } from "@/lib/agent/storeAgent/storeAgent";
import { serializeStore } from "@/lib/data/store";

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

        const { message, plan, threadId, selectedTheme, selectedThemeStructure, selectedProductPageStructure, finalStoreData } = await request.json();

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

        // If finalStoreData is provided, save the store directly
        if (finalStoreData && message === "Save store with these details") {
            // Import the save store function from tools
            const { saveStoreTool } = await import("@/lib/agent/storeAgent/tools");
            
            try {
                // Prepare store data with owner ID
                const storeDataToSave = {
                    ownerId: session.user.id,
                    brandName: finalStoreData.brandName,
                    domain: finalStoreData.domain,
                    description: finalStoreData.description,
                    themeId: selectedTheme?.themeId || finalStoreData.themeId,
                    theme: selectedTheme?.theme || finalStoreData.theme,
                    themeStructure: selectedThemeStructure || finalStoreData.themeStructure,
                    hero: finalStoreData.hero,
                    about: finalStoreData.about,
                    footer: finalStoreData.footer,
                    socialLinks: finalStoreData.socialLinks,
                    headerLinks: finalStoreData.headerLinks || [],
                };

                // Call the save store tool
                const result = await saveStoreTool.invoke(storeDataToSave);
                
                // Check if store was created successfully
                // The tool returns: "✅ Store "{brandName}" has been created successfully! Domain: ..."
                const storeCreated = result.includes('✅ Store') && result.includes('has been created successfully');
                
                // Check if store already exists (user is saving again, which means they've completed onboarding)
                const storeExists = result.includes('already exists');

                // If plan is free, set onboardingCompleted to true and active to true
                // This applies whether the store was just created OR already exists (user is completing onboarding)
                if (plan && plan.toLowerCase() === 'free' && user) {
                    // Check if store exists in database even if tool returned an error
                    let shouldCompleteOnboarding = storeCreated || storeExists;
                    
                    // If store creation failed but store might already exist, check database
                    if (!shouldCompleteOnboarding) {
                        try {
                            const existingStore = await Store.findOne({ owner: session.user.id });
                            if (existingStore) {
                                shouldCompleteOnboarding = true;
                            }
                        } catch (storeCheckError) {
                            console.error('Error checking store existence:', storeCheckError);
                        }
                    }
                    
                    if (shouldCompleteOnboarding) {
                        try {
                            // Check current status to avoid unnecessary updates
                            if (!user.onboardingCompleted || !user.active) {
                                user.onboardingCompleted = true;
                                user.active = true;
                                await user.save();
                            }
                        } catch (updateError) {
                            console.error('Error updating user onboarding status:', updateError);
                            // Still return success for store creation, but log the error
                        }
                    }
                }

                return NextResponse.json({
                    success: true,
                    message: result,
                    threadId: conversationThreadId,
                    storeCreated,
                    storeData: finalStoreData,
                });
            } catch (error) {
                console.error("Error saving store:", error);
                return NextResponse.json({
                    error: error instanceof Error ? error.message : "Failed to save store"
                }, { status: 500 });
            }
        }

        // Generate AI response using the store agent (pass selectedTheme, selectedThemeStructure, and selectedProductPageStructure if provided)
        const result = await generateStoreSetupResponse(
            session.user.id,
            message,
            plan,
            conversationThreadId,
            selectedTheme,
            selectedThemeStructure,
            selectedProductPageStructure
        );

        // Extract response and tool actions
        const response = result.message || '';
        const uiAction = result.uiAction || null;
        const storeCreated = response.includes('✅ Store') && response.includes('has been created successfully');
        let storeData = result.storeData || null;
        const showPreviewEdit = result.showPreviewEdit || false;

        // If store was created, fetch the saved store from database to get complete data
        if (storeCreated) {
            try {
                const savedStore = await Store.findOne({ owner: session.user.id }).lean();
                if (savedStore) {
                    storeData = serializeStore(savedStore);
                }
            } catch (error) {
                console.error("Error fetching saved store:", error);
                // Continue with storeData from result if fetch fails
            }
        }

        return NextResponse.json({
            success: true,
            message: response,
            threadId: conversationThreadId,
            storeCreated,
            uiAction,
            storeData,
            showPreviewEdit,
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
