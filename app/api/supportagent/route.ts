import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoDB'
import SupportAgent from '@/models/supportAgent'

export async function GET() {
  await connectDB()
  try {
    // Return single config (create if missing)
    let cfg = await SupportAgent.findOne()
    if (!cfg) {
      cfg = await SupportAgent.create({})
    }
    return NextResponse.json(cfg, { 
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  await connectDB()
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { prompt } = body
    if (typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    let cfg = await SupportAgent.findOne()
    if (!cfg) cfg = await SupportAgent.create({ prompt })
    else {
      cfg.prompt = prompt
      await cfg.save()
    }

    return NextResponse.json(cfg, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
