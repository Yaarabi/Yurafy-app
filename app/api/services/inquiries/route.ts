import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoDB';
import ServiceInquiry from '@/models/support/serviceInquiry';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

// GET - Fetch all service inquiries (Admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

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
        const { fullName, phoneNumber, email, serviceType, message, domainOfWork } = body;

        // Basic required fields validation
        if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
            return NextResponse.json(
                { error: 'Full name is required and must be a valid string' },
                { status: 400 }
            );
        }

        if (!phoneNumber || typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
            return NextResponse.json(
                { error: 'Phone number is required and must be a valid string' },
                { status: 400 }
            );
        }

        if (!serviceType || typeof serviceType !== 'string' || !serviceType.trim()) {
            return NextResponse.json(
                { error: 'Service type is required and must be a valid string' },
                { status: 400 }
            );
        }

        // Additional conditional requirements for "Other"
        if (serviceType === 'Other') {
            if (!domainOfWork || typeof domainOfWork !== 'string' || !domainOfWork.trim()) {
                return NextResponse.json(
                    { error: 'Domain of work is required when selecting "Other"' },
                    { status: 400 }
                );
            }
            if (!message || typeof message !== 'string' || !message.trim()) {
                return NextResponse.json(
                    { error: 'Additional details are required when selecting "Other"' },
                    { status: 400 }
                );
            }
        }

        // Create new inquiry with cleaned data
        const inquiry = await ServiceInquiry.create({
            fullName: fullName.trim(),
            phoneNumber: phoneNumber.trim(),
            email: email ? email.trim() : undefined,
            serviceType: serviceType.trim(),
            domainOfWork: domainOfWork?.trim() || undefined,
            message: message?.trim() || undefined,
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
                domainOfWork: inquiry.domainOfWork,
            },
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating service inquiry:', error);

        // Handle MongoDB validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            console.error('Validation error details:', messages);
            return NextResponse.json(
                { error: 'Validation error', details: messages },
                { status: 400 }
            );
        }

        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'This inquiry has already been submitted' },
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
        const session = await getServerSession(authOptions);

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
        const session = await getServerSession(authOptions);

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
