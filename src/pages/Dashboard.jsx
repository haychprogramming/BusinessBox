import { useLocalStorage } from '../hooks/useLocalStorage';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import PageContainer from '../components/PageContainer';

export default function Dashboard() {
    const [clients] = useLocalStorage('clients', []);
    const [invoices] = useLocalStorage('invoices', []);

    const totalRevenue = invoices
        .filter(i => i.status === 'Paid')
        .reduce((sum, i) => sum + i.total, 0);

    const pendingRevenue = invoices
        .filter(i => i.status === 'Pending')
        .reduce((sum, i) => sum + i.total, 0);

    // Mock data for the chart - in a real app this would be aggregated by month
    const data = [
        { name: 'Jan', total: 1200 },
        { name: 'Feb', total: 2100 },
        { name: 'Mar', total: 1800 },
        { name: 'Apr', total: 2400 },
        { name: 'May', total: 3200 },
        { name: 'Jun', total: totalRevenue > 4000 ? totalRevenue : 4500 },
    ];

    return (
        <PageContainer className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Revenue</h3>
                    </div>
                    <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Lifetime earnings</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Active Clients</h3>
                    </div>
                    <div className="text-2xl font-bold">{clients.filter(c => c.status === 'Active').length}</div>
                    <p className="text-xs text-muted-foreground">Total: {clients.length}</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Pending Invoices</h3>
                    </div>
                    <div className="text-2xl font-bold">${pendingRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">{invoices.filter(i => i.status === 'Pending').length} invoices</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Overdue</h3>
                    </div>
                    <div className="text-2xl font-bold">
                        ${invoices.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.total, 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">Action required</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6">
                        <h3 className="text-lg font-medium">Revenue Overview</h3>
                    </div>
                    <div className="pl-2 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip />
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6">
                        <h3 className="text-lg font-medium">Recent Invoices</h3>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="space-y-8">
                            {invoices.slice(0, 5).map(invoice => {
                                const client = clients.find(c => c.id === invoice.clientId);
                                return (
                                    <div key={invoice.id} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{client?.name || 'Unknown'}</p>
                                            <p className="text-sm text-muted-foreground">{invoice.number}</p>
                                        </div>
                                        <div className="ml-auto font-medium">+${invoice.total.toFixed(2)}</div>
                                    </div>
                                );
                            })}
                            {invoices.length === 0 && <p className="text-muted-foreground text-sm">No recent activity.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    )
}
