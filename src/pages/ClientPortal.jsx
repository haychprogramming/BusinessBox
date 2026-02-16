import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, FileText, CheckCircle } from 'lucide-react';

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

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <Button variant="ghost" className="absolute top-4 left-4" onClick={() => navigate('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
                </Button>
                <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Client Portal</h2>
                        <p className="mt-2 text-sm text-slate-600">Simulate client access by selecting a client below.</p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Select Client</label>
                                <select
                                    required
                                    className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        <Button type="submit" className="w-full">
                            Enter Portal
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Welcome, {currentClient?.name}
                    </h1>
                    <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
                        Sign Out
                    </Button>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Stats */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CreditCard className="h-6 w-6 text-slate-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-slate-500">Outstanding Balance</dt>
                                        <dd className="text-2xl font-semibold text-slate-900">${totalDue.toFixed(2)}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FileText className="h-6 w-6 text-slate-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-slate-500">Total Invoices</dt>
                                        <dd className="text-2xl font-semibold text-slate-900">{clientInvoices.length}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-slate-500">Projects Active</dt>
                                        <dd className="text-2xl font-semibold text-slate-900">1</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-lg font-medium leading-6 text-slate-900 mb-4">Your Invoices</h2>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <ul className="divide-y divide-slate-200">
                        {clientInvoices.length > 0 ? (
                            clientInvoices.map((invoice) => (
                                <li key={invoice.id} className="px-6 py-4 hover:bg-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-900">Invoice #{invoice.number}</p>
                                            <p className="text-sm text-slate-500">Due {invoice.dueDate}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                    invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {invoice.status}
                                            </span>
                                            <p className="font-medium text-slate-900">${invoice.total.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-6 py-4 text-center text-slate-500">No invoices found.</li>
                        )}
                    </ul>
                </div>
            </main>
        </div>
    );
}
