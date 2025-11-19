import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import User from '@/models/users';
import Plan from '@/models/plan';

// GET: Fetch user's current plan (Admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find the user's current active plan
    const plan = await Plan.findOne({ userId: id, status: 'active' }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('GET /api/users/[id]/plan error:', error);
    return NextResponse.json({ error: 'Failed to fetch user plan' }, { status: 500 });
  }
}

// PUT: Update user's plan (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { planKey, durationDays, startDate, endDate, active, mode = 'upgrade' } = body;

    if (!planKey || !durationDays || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let plan;

    if (mode === 'update') {
      // Update existing active plan
      plan = await Plan.findOneAndUpdate(
        { userId: id, status: 'active' },
        {
          $set: {
            planKey,
            durationDays: parseInt(durationDays),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          },
        },
        { new: true, runValidators: true }
      );

      if (!plan) {
        // If no active plan exists, create a new one
        plan = await Plan.create({
          userId: id,
          planKey,
          price: 0,
          durationDays: parseInt(durationDays),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: 'active',
        });
        user.currentPlanId = plan._id;
      }
    } else {
      // Upgrade/Change plan - cancel old and create new
      await Plan.updateMany(
        { userId: id, status: 'active' },
        { $set: { status: 'cancelled' } }
      );

      // Create new plan
      plan = await Plan.create({
        userId: id,
        planKey,
        price: 0, // Admin-created plans have no price
        durationDays: parseInt(durationDays),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'active',
      });

      user.currentPlanId = plan._id;
    }

    // Update user's active status
    if (typeof active === 'boolean') {
      user.active = active;
    }
    await user.save();

    return NextResponse.json({
      message: mode === 'update' ? 'Plan updated successfully' : 'Plan upgraded successfully',
      plan,
    });
  } catch (error) {
    console.error('PUT /api/users/[id]/plan error:', error);
    return NextResponse.json({ error: 'Failed to update user plan' }, { status: 500 });
  }
}
