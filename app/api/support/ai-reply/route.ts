import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoDB'
import SupportAgent from '@/models/supportAgent'
import SupportMessage from '@/models/support'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'

import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { ChatMistralAI } from '@langchain/mistralai'
import { tool } from '@langchain/core/tools'
import { MemorySaver } from '@langchain/langgraph'
import { z } from 'zod'

/**
 * Build a React agent that can optionally call an `add_support_note` tool during
 * generation to persist notes about the visitor. The agent uses the owner prompt
 * stored in `SupportAgent` as its system instruction.
 */
async function generateBotReply(prompt: string, userMessage: string, opts?: { ownerId?: string; guestName?: string; contact?: string }) {
    await connectDB()

    // Create an LLM instance (same config used elsewhere in the codebase)
    const model = new ChatMistralAI({ model: 'mistral-large-latest', apiKey: process.env.MISTRAL_API_KEY, temperature: 0.7 })

    // Tool to add a support note to the SupportAgent config
    const addSupportNoteTool = tool(
        async ({ guestName, contact, note }: { ownerId?: string; guestName?: string; contact?: string; note: string }) => {
        // Use the supportagent notes API to persist notes so all writes go through the API layer.
        // Build an absolute URL from NEXTAUTH_URL or localhost fallback.
        const base = process.env.NEXTAUTH_URL
        try {
            await fetch(`${base}/api/supportagent/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-call': process.env.INTERNAL_API_KEY || '',
            },
            body: JSON.stringify({ guestName, contact, note }),
            })
            return `✅ Note saved via API`
        } catch (err) {
            console.error('Failed to call notes API:', err)
            return `⚠️ Failed to save note: ${err}`
        }
        },
        {
        name: 'add_support_note',
        description: 'Add a short note about the visitor (guest name, contact, and note).',
        schema: z.object({ ownerId: z.string().optional(), guestName: z.string().optional(), contact: z.string().optional(), note: z.string() }),
        }
    )

    // Create the react agent with only the add-note tool (keeps scope small)
    // Use MemorySaver to keep agent memory in-memory (compatible with other agents)
    const agent = await createReactAgent({ llm: model, tools: [addSupportNoteTool], checkpointSaver: new MemorySaver(), prompt })

    // Invoke the agent. The agent can call the add_support_note tool if it decides to.
    const threadId = opts?.ownerId ? `support-${opts.ownerId}` : `support-global`
    const res = await agent.invoke(
        { messages: [{ role: 'user', content: userMessage }] },
        { configurable: { thread_id: threadId, recursionLimit: 6 } }
    )

    return res.messages?.at(-1)?.content || 'No reply generated.'
    }

export async function POST(req: NextRequest) {
    await connectDB()
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { text, guestName, contact } = body
        if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 })

        const cfg = await SupportAgent.findOne()
        const prompt = cfg?.prompt || 'Be helpful.'

        // Generate bot reply (stub)
        const botText = await generateBotReply(prompt, text)

        // Save bot message
        const botMsg = await SupportMessage.create({ owner: session.user.id, role: 'bot', text: botText })

        // Optionally add a note to support agent notes using the notes API so it appears in admin.
        try {
        const base = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`
        await fetch(`${base}/api/supportagent/notes`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'x-internal-call': process.env.INTERNAL_API_KEY || '',
            },
            body: JSON.stringify({ guestName: guestName || undefined, contact: contact || undefined, note: `Auto-note: ${text.substring(0, 200)}` }),
        })
        } catch (err) {
        console.error('Failed to save auto-note via API:', err)
        }

        return NextResponse.json({ bot: botMsg }, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
