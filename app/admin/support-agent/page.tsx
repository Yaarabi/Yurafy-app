import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoDB'
import SupportAgent from '@/models/supportAgent'

export default async function Page() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return <div className="p-8">Unauthorized</div>
  }

  await connectDB()
  const cfg = (await SupportAgent.findOne()) || { prompt: '', notes: [] }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Support Agent</h1>
      <section className="mb-6">
        <h2 className="font-semibold">Prompt (managed by admin)</h2>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded mt-2">{cfg.prompt}</pre>
        <form method="post" action="/api/supportagent">
          <input type="hidden" name="_method" value="patch" />
          <textarea name="prompt" defaultValue={cfg.prompt} className="w-full mt-2 p-2 border rounded" rows={6}></textarea>
          <div className="mt-2">
            <button className="px-3 py-2 bg-indigo-600 text-white rounded">Save</button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-semibold">Notes</h2>
        <div className="mt-2 space-y-2">
          {cfg.notes && cfg.notes.length > 0 ? (
            cfg.notes.map((n: any) => (
              <div key={n._id} className="border p-3 rounded bg-white dark:bg-gray-800">
                <div className="text-sm text-gray-500">{n.guestName || 'Guest'} • {n.contact || '—'}</div>
                <div className="mt-1">{n.note}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No notes yet.</div>
          )}
        </div>
      </section>
    </div>
  )
}
