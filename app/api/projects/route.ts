import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoDB';
import Project from '@/models/support/projects';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const projects = await Project.find({ isActive: true }).sort({ order: 1 }).lean();
        return NextResponse.json({ projects });
    } catch (error) {
        console.error('Public projects GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}
