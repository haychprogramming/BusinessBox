import { useLocalStorage } from '../hooks/useLocalStorage';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import PageContainer from '../components/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { motion } from 'framer-motion';

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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <PageContainer className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent w-max">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, here is your financial overview.</p>
            </div>

            <motion.div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{clients.filter(c => c.status === 'Active').length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total: {clients.length}</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">${pendingRevenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground mt-1">{invoices.filter(i => i.status === 'Pending').length} invoices</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-destructive">
                                ${invoices.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.total, 0).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Action required</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                                />
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {invoices.slice(0, 5).map(invoice => {
                                const client = clients.find(c => c.id === invoice.clientId);
                                return (
                                    <div key={invoice.id} className="flex items-center group">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                            {client?.name ? client.name.substring(0, 2).toUpperCase() : 'U'}
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-semibold leading-none">{client?.name || 'Unknown'}</p>
                                            <p className="text-xs text-muted-foreground">{invoice.number}</p>
                                        </div>
                                        <div className="ml-auto font-bold text-sm bg-muted/50 px-3 py-1 rounded-full">+${invoice.total.toFixed(2)}</div>
                                    </div>
                                );
                            })}
                            {invoices.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No recent activity.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    )
}
