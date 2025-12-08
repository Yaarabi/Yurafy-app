import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoDB';
import Guide from '@/models/support/guides';

// GET: Public fetch of active guides, optionally filtered by category
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category') || undefined;

        const query: Record<string, any> = { isActive: true };
        if (category) query.category = category;

        const guides = await Guide.find(query).sort({ category: 1, order: 1 }).lean();
        return NextResponse.json({ guides });
    } catch (error) {
        console.error('GET /api/guides/public error:', error);
        return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 });
    }
}
