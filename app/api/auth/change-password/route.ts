import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import User from '@/models/users';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const { currentPassword, newPassword } = await req.json();

        // Validation
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current and new password are required' },
                { status: 400 }
            );
        }

        if (currentPassword === newPassword) {
            return NextResponse.json(
                { error: 'New password must be different from current password' },
                { status: 400 }
            );
        }

        // Validate new password strength
        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        if (!/[A-Z]/.test(newPassword)) {
            return NextResponse.json(
                { error: 'Password must contain an uppercase letter' },
                { status: 400 }
            );
        }

        if (!/[a-z]/.test(newPassword)) {
            return NextResponse.json(
                { error: 'Password must contain a lowercase letter' },
                { status: 400 }
            );
        }

        if (!/[0-9]/.test(newPassword)) {
            return NextResponse.json(
                { error: 'Password must contain a number' },
                { status: 400 }
            );
        }

        // Find user and include password field
        const user = await User.findById(session.user.id).select('+password');

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json(
            { message: 'Password changed successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
