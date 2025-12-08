import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Store from "@/models/store/store";

/**
 * POST /api/store/validate-domain
 * - Check if a domain is available
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { domain } = body;

        if (!domain || typeof domain !== 'string') {
            return NextResponse.json({ 
                error: "Domain is required" 
            }, { status: 400 });
        }

        // Normalize domain (lowercase, remove special chars, hyphenate)
        const normalizedDomain = domain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        if (normalizedDomain.length < 3) {
            return NextResponse.json({ 
                available: false,
                error: "Domain must be at least 3 characters long" 
            }, { status: 400 });
        }

        await connectDB();

        // Check if domain exists
        const existingStore = await Store.findOne({ domain: normalizedDomain });

        if (existingStore) {
            return NextResponse.json({ 
                available: false,
                error: "This domain is already taken" 
            });
        }

        return NextResponse.json({ 
            available: true,
            domain: normalizedDomain
        });
    } catch (err) {
        console.error("Error validating domain:", err);
        return NextResponse.json({ 
            error: "Failed to validate domain" 
        }, { status: 500 });
    }
}

