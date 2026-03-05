import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, FileText, CheckCircle, LogIn } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';

export default function ClientPortal() {
    const navigate = useNavigate();
    const [clients] = useLocalStorage('clients', []);
    const [invoices] = useLocalStorage('invoices', []);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Mock login just selects a client
    const handleLogin = (e) => {
        e.preventDefault();
        if (selectedClientId) {
            setIsLoggedIn(true);
        }
    };

    const currentClient = clients.find(c => c.id === selectedClientId);
    const clientInvoices = invoices.filter(i => i.clientId === selectedClientId);
    const totalDue = clientInvoices
        .filter(i => i.status !== 'Paid')
        .reduce((sum, i) => sum + i.total, 0);

    return (
        <div>
            {!isLoggedIn ? (
                <div
                    key="login"
                    className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
                    <Button variant="ghost" className="absolute top-4 left-4 z-10" onClick={() => navigate('/')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
                    </Button>
                    <div
                        className="w-full max-w-md z-10"
                    >
                        <Card className="shadow-2xl border-border/50 bg-card/80 backdrop-blur-xl">
                            <CardHeader className="text-center pt-8">
                                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <LogIn className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-extrabold tracking-tight">Client Portal</CardTitle>
                                <p className="text-muted-foreground mt-2">Sign in to view your account details.</p>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-6" onSubmit={handleLogin}>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium">Select Client (Demo)</label>
                                            <select
                                                required
                                                className="mt-1 block w-full rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                value={selectedClientId}
                                                onChange={(e) => setSelectedClientId(e.target.value)}
                                            >
                                                <option value="">Select a client...</option>
                                                {clients.map(client => (
                                                    <option key={client.id} value={client.id}>{client.name} ({client.company})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <Button type="submit" size="lg" className="w-full rounded-full shadow-lg">
                                        Enter Portal
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div
                    key="dashboard"
                    className="min-h-screen bg-background"
                >
                    <header className="border-b bg-card/80 backdrop-blur-xl sticky top-0 z-40">
                        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                    {currentClient?.name.substring(0, 2).toUpperCase()}
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    Welcome, {currentClient?.name.split(' ')[0]}
                                </h1>
                            </div>
                            <Button variant="outline" className="rounded-full shadow-sm" onClick={() => setIsLoggedIn(false)}>
                                Sign Out
                            </Button>
                        </div>
                    </header>
                    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
                        {/* Stats */}
                        <div
                            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl">
                                            <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="ml-5">
                                            <p className="text-sm font-medium text-muted-foreground">Outstanding Balance</p>
                                            <div className="text-2xl font-bold">${totalDue.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                                            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="ml-5">
                                            <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                                            <div className="text-2xl font-bold">{clientInvoices.length}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl">
                                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="ml-5">
                                            <p className="text-sm font-medium text-muted-foreground">Projects Active</p>
                                            <div className="text-2xl font-bold">1</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold tracking-tight mb-4">Your Invoices</h2>
                            <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                    <ul className="divide-y divide-border/50">
                                        {clientInvoices.length > 0 ? (
                                            clientInvoices.map((invoice) => (
                                                <li key={invoice.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div>
                                                            <p className="font-semibold text-lg flex items-center gap-2">
                                                                Invoice #{invoice.number}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground mt-1">Due {invoice.dueDate}</p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                                invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                                                                    invoice.status === 'Partial' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {invoice.status}
                                                            </span>
                                                            <p className="font-bold text-lg">${invoice.total.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="px-6 py-8 text-center text-muted-foreground">No invoices found.</li>
                                        )}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            )}
        </div>
    );
}
