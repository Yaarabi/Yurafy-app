import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import AIAgent from "@/models/automation/ai-agent";
import User from "@/models/users";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get all AI agents with owner information
        const agents = await AIAgent.find({})
            .populate('owner', 'username email _id')
            .lean();

        const agentsWithOwner = agents.map((agent: any) => ({
            _id: agent._id,
            owner: agent.owner ? {
                _id: agent.owner._id,
                username: agent.owner.username,
                email: agent.owner.email,
            } : null,
            enabled: agent.enabled || false,
            active: agent.active || false,
            createdAt: agent.createdAt,
            updatedAt: agent.updatedAt,
        }));

        return NextResponse.json({ agents: agentsWithOwner });
    } catch (error) {
        console.error('Admin get agents error:', error);
        return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
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
        const { agentId, active } = body;

        if (!agentId || typeof active !== 'boolean') {
            return NextResponse.json({ error: 'Agent ID and active status required' }, { status: 400 });
        }

        const agent = await AIAgent.findById(agentId);
        if (!agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        agent.active = active;
        await agent.save();

        return NextResponse.json({ message: 'Agent updated successfully', agent });
    } catch (error) {
        console.error('Admin update agent error:', error);
        return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
    }
}

