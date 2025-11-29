import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoDB'
import SupportAgent, { ISupportAgentNote } from '@/models/supportAgent'


export async function GET() {
    await connectDB()
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const cfg = await SupportAgent.findOne()
        return NextResponse.json(cfg?.notes || [], { status: 200 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    await connectDB()
    try {
        const body = await req.json()
        const { guestName, contact, note } = body
        if (!note || typeof note !== 'string') {
        return NextResponse.json({ error: 'Missing note' }, { status: 400 })
        }

        let cfg = await SupportAgent.findOne()
        if (!cfg) cfg = await SupportAgent.create({})

        cfg.notes.push({ guestName, contact, note })
        await cfg.save()

        return NextResponse.json(cfg.notes, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    await connectDB()
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const url = new URL(req.url)
        const id = url.searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

        const cfg = await SupportAgent.findOne()
        if (!cfg) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        cfg.notes = cfg.notes.filter((n: ISupportAgentNote) => (n as any)._id?.toString() !== id)
        await cfg.save()

        return NextResponse.json(cfg.notes, { status: 200 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
