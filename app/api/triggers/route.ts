import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoDB';
import OrderMessageTrigger from '@/models/automation/orderMessageTrigger';
import WhatsAppAccount from '@/models/automation/whatsappAccount';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

// GET /api/triggers - Get all triggers for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const whatsappAccountId = searchParams.get('whatsappAccountId');
    const orderStatus = searchParams.get('orderStatus');
    const active = searchParams.get('active');
    const id = searchParams.get('id');

    // If ID is provided, return single trigger
    if (id) {
      const trigger = await OrderMessageTrigger.findOne({
        _id: id,
        ownerId: session.user.id
      });

      if (!trigger) {
        return NextResponse.json(
          { error: 'Order message trigger not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: trigger
      });
    }

    // Build query for multiple triggers
    const query: any = { ownerId: session.user.id };
    
    if (whatsappAccountId) {
      query.whatsappAccountId = whatsappAccountId;
    }
    
    if (orderStatus) {
      query.orderStatus = orderStatus;
    }
    
    if (active !== null) {
      query.active = active === 'true';
    }

    const triggers = await OrderMessageTrigger.find(query)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: triggers,
      count: triggers.length
    });

  } catch (error: any) {
    console.error('Error fetching order message triggers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order message triggers' },
      { status: 500 }
    );
  }
}

// POST /api/triggers - Create a new trigger
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { name, orderStatus, template, active = true, auto = false, timing = 0, whatsappAccountId: providedWhatsappAccountId } = body;

    // Validate required fields
    if (!name || !orderStatus || !template) {
      return NextResponse.json(
        { error: 'Name, order status, and template are required' },
        { status: 400 }
      );
    }

    let whatsappAccountId = providedWhatsappAccountId;

    if (whatsappAccountId) {
      // Verify ownership of the provided WhatsApp account
      const account = await WhatsAppAccount.findOne({ 
        _id: whatsappAccountId, 
        owner: session.user.id 
      });
      
      if (!account) {
        return NextResponse.json(
          { error: 'Invalid WhatsApp account' },
          { status: 400 }
        );
      }
    } else {
      // Find default WhatsApp Account for the user
      const account = await WhatsAppAccount.findOne({ owner: session.user.id });
      if (!account) {
        return NextResponse.json(
          { error: 'WhatsApp account not found. Please connect your WhatsApp account first.' },
          { status: 404 }
        );
      }
      whatsappAccountId = account._id;
    }

    // Check if trigger already exists for this combination
    const existingTrigger = await OrderMessageTrigger.findOne({
      ownerId: session.user.id,
      whatsappAccountId,
      orderStatus
    });

    if (existingTrigger) {
      return NextResponse.json(
        { error: 'A trigger for this order status already exists' },
        { status: 409 }
      );
    }

    // Create new trigger
    const trigger = new OrderMessageTrigger({
      ownerId: session.user.id,
      whatsappAccountId,
      name,
      orderStatus,
      template,
      active,
      auto,
      timing
    });

    await trigger.save();

    return NextResponse.json({
      success: true,
      data: trigger,
      message: 'Order message trigger created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating order message trigger:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A trigger for this combination already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order message trigger' },
      { status: 500 }
    );
  }
}

// PUT /api/triggers - Update a trigger
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { id, name, orderStatus, template, active, auto, timing } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Trigger ID is required' },
        { status: 400 }
      );
    }

    // Find the trigger
    const trigger = await OrderMessageTrigger.findOne({
      _id: id,
      ownerId: session.user.id
    });

    if (!trigger) {
      return NextResponse.json(
        { error: 'Order message trigger not found' },
        { status: 404 }
      );
    }

    // If changing orderStatus, check for conflicts
    if (orderStatus && orderStatus !== trigger.orderStatus) {
      const conflictQuery = {
        ownerId: session.user.id,
        whatsappAccountId: trigger.whatsappAccountId,
        orderStatus: orderStatus,
        _id: { $ne: id }
      };

      const existingTrigger = await OrderMessageTrigger.findOne(conflictQuery);
      
      if (existingTrigger) {
        return NextResponse.json(
          { error: 'A trigger for this order status already exists' },
          { status: 409 }
        );
      }
    }

    // Update trigger
    const updatedTrigger = await OrderMessageTrigger.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(orderStatus && { orderStatus }),
        ...(template && { template }),
        ...(active !== undefined && { active }),
        ...(auto !== undefined && { auto }),
        ...(timing !== undefined && { timing })
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedTrigger,
      message: 'Order message trigger updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating order message trigger:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A trigger for this combination already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update order message trigger' },
      { status: 500 }
    );
  }
}

// DELETE /api/triggers - Delete a trigger
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Trigger ID is required' },
        { status: 400 }
      );
    }

    const trigger = await OrderMessageTrigger.findOneAndDelete({
      _id: id,
      ownerId: session.user.id
    });

    if (!trigger) {
      return NextResponse.json(
        { error: 'Order message trigger not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order message trigger deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting order message trigger:', error);
    return NextResponse.json(
      { error: 'Failed to delete order message trigger' },
      { status: 500 }
    );
  }
}