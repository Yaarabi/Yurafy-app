import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import Guide from '@/models/support/guides';

// GET: Fetch all active guides
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // For regular users, return only active guides
        // For admins, return all guides
        const isAdmin = session.user.role === 'admin';
        
        const query = isAdmin ? {} : { isActive: true };
        const guides = await Guide.find(query).sort({ category: 1, order: 1 }).lean();

        return NextResponse.json({ guides }, {
            headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            },
        });
    } catch (error) {
        console.error('GET /api/guides error:', error);
        return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 });
    }
}

// POST: Create a new guide (Admin only)
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { category, title, description, videoUrl, order, isActive } = body;

        if (!category || !title || !description || !videoUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const guide = await Guide.create({
            category,
            title,
            description,
            videoUrl,
            order: order ?? 0,
            isActive: isActive ?? true,
        });

        return NextResponse.json({ guide, message: 'Guide created successfully' });
    } catch (error) {
        console.error('POST /api/guides error:', error);
        return NextResponse.json({ error: 'Failed to create guide' }, { status: 500 });
    }
}

// PUT: Update a guide (Admin only)
export async function PUT(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, category, title, description, videoUrl, order, isActive } = body;

        if (!id) {
            return NextResponse.json({ error: 'Guide ID is required' }, { status: 400 });
        }

        const guide = await Guide.findByIdAndUpdate(
            id,
            {
                category,
                title,
                description,
                videoUrl,
                order,
                isActive,
            },
            { new: true, runValidators: true }
        );

        if (!guide) {
            return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
        }

        return NextResponse.json({ guide, message: 'Guide updated successfully' });
    } catch (error) {
        console.error('PUT /api/guides error:', error);
        return NextResponse.json({ error: 'Failed to update guide' }, { status: 500 });
    }
}

// DELETE: Delete a guide (Admin only)
export async function DELETE(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Guide ID is required' }, { status: 400 });
        }

        const guide = await Guide.findByIdAndDelete(id);

        if (!guide) {
            return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Guide deleted successfully' });
    } catch (error) {
        console.error('DELETE /api/guides error:', error);
        return NextResponse.json({ error: 'Failed to delete guide' }, { status: 500 });
    }
}
