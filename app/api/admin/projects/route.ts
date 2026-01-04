import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import Project from '@/models/support/projects';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const projects = await Project.find({}).sort({ order: 1 }).lean();
        return NextResponse.json({ projects });
    } catch (error) {
        console.error('Admin projects GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();
        const { name, link, img, order, isActive } = body;

        if (!name || !link || !img) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const project = await Project.create({ name, link, img, order: order || 0, isActive: isActive ?? true });
        return NextResponse.json({ message: 'Project created', project });
    } catch (error) {
        console.error('Admin projects POST error:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();
        const { projectId, name, link, img, order, isActive } = body;

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        }

        const project = await Project.findById(projectId);
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        if (name !== undefined) project.name = name;
        if (link !== undefined) project.link = link;
        if (img !== undefined) project.img = img;
        if (order !== undefined) project.order = order;
        if (isActive !== undefined) project.isActive = isActive;

        await project.save();

        return NextResponse.json({ message: 'Project updated', project });
    } catch (error) {
        console.error('Admin projects PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const id = req.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Project id required' }, { status: 400 });

        const project = await Project.findById(id);
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        await project.remove();
        return NextResponse.json({ message: 'Project deleted' });
    } catch (error) {
        console.error('Admin projects DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
