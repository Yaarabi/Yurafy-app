import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

async function getOverview() {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/overview`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
}

export default async function AdminPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'admin') {
        redirect('/en');
    }

    const overview = await getOverview();
    if (!overview) {
        return <div className="p-6">Failed to load.</div>;
    }

    const c = overview.counts || {};

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card title="Users" value={c.users} />
                <Card title="Stores" value={c.stores} />
                <Card title="Orders" value={c.orders} />
                <Card title="WhatsApp" value={c.whatsappAccounts} />
                <Card title="Support Msgs" value={c.supportMessages} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Section title="Recent Users">
                    <SimpleTable rows={overview.recent?.users || []} columns={[{ key: 'username', label: 'Username' }, { key: 'email', label: 'Email' }, { key: 'createdAt', label: 'Joined' }]} />
                </Section>
                <Section title="Recent Orders">
                    <SimpleTable rows={overview.recent?.orders || []} columns={[{ key: 'customerName', label: 'Customer' }, { key: 'total', label: 'Total' }, { key: 'status', label: 'Status' }, { key: 'createdAt', label: 'Date' }]} />
                </Section>
            </div>
        </div>
    );
}

function Card({ title, value }: { title: string; value: number }) {
    return (
        <div className="rounded-lg border p-4 bg-white">
            <div className="text-sm text-gray-500">{title}</div>
            <div className="text-2xl font-semibold">{value ?? 0}</div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: any }) {
    return (
        <div className="rounded-lg border bg-white p-4">
            <h2 className="text-lg font-semibold mb-3">{title}</h2>
            {children}
        </div>
    );
}

function SimpleTable({ rows, columns }: { rows: any[]; columns: { key: string; label: string }[] }) {
    return (
        <div className="overflow-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="text-left border-b">
                        {columns.map((c) => (
                            <th key={c.key} className="py-2 pr-4">{c.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, idx) => (
                        <tr key={idx} className="border-b">
                            {columns.map((c) => (
                                <td key={c.key} className="py-2 pr-4">{String(r[c.key] ?? '')}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


