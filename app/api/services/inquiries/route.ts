import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoDB';
import ServiceInquiry from '@/models/serviceInquiry';
import { getServerSession } from 'next-auth';

// GET - Fetch all service inquiries (Admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();

        // Check if user is admin
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        await connectDB();

        // Get query parameters for filtering and sorting
        const { searchParams } = new URL(request.url);
        const serviceType = searchParams.get('serviceType');
        const status = searchParams.get('status');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const order = searchParams.get('order') === 'asc' ? 1 : -1;

        // Build query
        const query: any = {};
        if (serviceType && serviceType !== 'all') {
            query.serviceType = serviceType;
        }
        if (status && status !== 'all') {
            query.status = status;
        }

        // Fetch inquiries with filtering and sorting
        const inquiries = await ServiceInquiry.find(query)
            .sort({ [sortBy]: order })
            .lean();

        return NextResponse.json({
            success: true,
            inquiries,
            count: inquiries.length,
        });
    } catch (error) {
        console.error('Error fetching service inquiries:', error);
        return NextResponse.json(
            { error: 'Failed to fetch service inquiries' },
            { status: 500 }
        );
    }
}

// POST - Create a new service inquiry
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { fullName, phoneNumber, email, serviceType, message } = body;

        // Validate required fields
        if (!fullName || !phoneNumber || !email || !serviceType) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create new inquiry
        const inquiry = await ServiceInquiry.create({
            fullName,
            phoneNumber,
            email,
            serviceType,
            message: message || '',
            status: 'new',
        });

        return NextResponse.json({
            success: true,
            message: 'Your inquiry has been submitted successfully! We will contact you soon.',
            inquiry: {
                id: inquiry._id,
                fullName: inquiry.fullName,
                email: inquiry.email,
                serviceType: inquiry.serviceType,
            },
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating service inquiry:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json(
                { error: 'Validation error', details: messages },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to submit inquiry. Please try again.' },
            { status: 500 }
        );
    }
}

// PATCH - Update inquiry status (Admin only)
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession();

        // Check if user is admin
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json(
                { error: 'Missing inquiry ID or status' },
                { status: 400 }
            );
        }

        const inquiry = await ServiceInquiry.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!inquiry) {
            return NextResponse.json(
                { error: 'Inquiry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Inquiry status updated successfully',
            inquiry,
        });
    } catch (error) {
        console.error('Error updating inquiry status:', error);
        return NextResponse.json(
            { error: 'Failed to update inquiry status' },
            { status: 500 }
        );
    }
}

// DELETE - Delete an inquiry (Admin only)
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession();

        // Check if user is admin
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Missing inquiry ID' },
                { status: 400 }
            );
        }

        const inquiry = await ServiceInquiry.findByIdAndDelete(id);

        if (!inquiry) {
            return NextResponse.json(
                { error: 'Inquiry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Inquiry deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        return NextResponse.json(
            { error: 'Failed to delete inquiry' },
            { status: 500 }
        );
    }
}
