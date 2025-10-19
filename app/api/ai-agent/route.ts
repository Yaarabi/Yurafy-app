
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import AIAgent from "@/models/ai-agent";

export async function GET(req: NextRequest) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    if (!owner) return NextResponse.json({ error: "Missing owner" }, { status: 400 });

    const agent = await AIAgent.findOne({ owner });
    return NextResponse.json({ agent });
}

export async function POST(req: NextRequest) {
    await connectDB();
    const body = await req.json();
    const agent = await AIAgent.create(body);
    return NextResponse.json({ agent });
}

export async function PUT(req: NextRequest) {
    await connectDB();
    const body = await req.json();
    const { owner } = body;
    if (!owner) return NextResponse.json({ error: "Missing owner" }, { status: 400 });

    const agent = await AIAgent.findOneAndUpdate({ owner }, body, { new: true, upsert: true });
    return NextResponse.json({ agent });
}
