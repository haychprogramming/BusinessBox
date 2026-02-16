import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, Search, FileText, Download, Pencil, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PageContainer from '../components/PageContainer';

export default function Invoices() {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useLocalStorage('invoices', []);
    const [clients] = useLocalStorage('clients', []);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [clientFilter, setClientFilter] = useState('All');

    const getClientName = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        return client ? client.name : 'Unknown Client';
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getClientName(invoice.clientId).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
        const matchesClient = clientFilter === 'All' || invoice.clientId === clientFilter;
        return matchesSearch && matchesStatus && matchesClient;
    });

    const generatePDF = (invoice) => {
        const doc = new jsPDF();
        const client = clients.find(c => c.id === invoice.clientId);

        doc.setFontSize(20);
        doc.text('INVOICE', 14, 22);

        doc.setFontSize(10);
        doc.text(`Invoice #: ${invoice.number}`, 14, 30);
        doc.text(`Date: ${invoice.date}`, 14, 35);
        doc.text(`Due Date: ${invoice.dueDate}`, 14, 40);

        doc.text('Bill To:', 14, 55);
        if (client) {
            doc.text(client.name, 14, 60);
            doc.text(client.email, 14, 65);
            if (client.company) doc.text(client.company, 14, 70);
        }

        autoTable(doc, {
            startY: 80,
            head: [['Description', 'Qty', 'Price', 'Total']],
            body: invoice.items.map(item => [
                item.description,
                item.qty,
                `$${item.price}`,
                `$${(item.qty * item.price).toFixed(2)}`
            ]),
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.text(`Total: $${invoice.total.toFixed(2)}`, 14, finalY);

        doc.save(`invoice_${invoice.number}.pdf`);
    };

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'Bank Transfer',
        note: ''
    });

    const handleOpenPaymentModal = (invoice) => {
        const remaining = invoice.total - (invoice.amountPaid || 0);
        setSelectedInvoice(invoice);
        setPaymentData({
            amount: remaining > 0 ? remaining.toFixed(2) : '0.00',
            date: new Date().toISOString().split('T')[0],
            method: 'Bank Transfer',
            note: ''
        });
        setIsPaymentModalOpen(true);
    };

    const handleSavePayment = (e) => {
        e.preventDefault();
        if (!selectedInvoice) return;

        const paymentAmount = parseFloat(paymentData.amount);
        const currentPaid = selectedInvoice.amountPaid || 0;
        const newPaid = currentPaid + paymentAmount;

        // Determine status
        let newStatus = selectedInvoice.status;
        if (newPaid >= selectedInvoice.total) {
            newStatus = 'Paid';
        } else if (newPaid > 0) {
            newStatus = 'Partial';
        }

        const updatedInvoice = {
            ...selectedInvoice,
            amountPaid: newPaid,
            status: newStatus,
            payments: [
                ...(selectedInvoice.payments || []),
                {
                    id: Date.now().toString(),
                    ...paymentData,
                    amount: paymentAmount
                }
            ]
        };

        setInvoices(invoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
        setIsPaymentModalOpen(false);
    };

    return (
        <PageContainer className="space-y-6">
            {/* Header and Filters (SAME) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">Manage and track your invoices.</p>
                </div>
                <Link to="/invoices/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Invoice
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search invoices..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Multiple">Partial</option>
                    <option value="Overdue">Overdue</option>
                </select>
                <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={clientFilter}
                    onChange={(e) => setClientFilter(e.target.value)}
                >
                    <option value="All">All Clients</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                </select>
            </div>

            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Number</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Client</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Amount</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Paid</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{invoice.number}</td>
                                        <td className="p-4 align-middle">{getClientName(invoice.clientId)}</td>
                                        <td className="p-4 align-middle">{invoice.date}</td>
                                        <td className="p-4 align-middle">${invoice.total.toFixed(2)}</td>
                                        <td className="p-4 align-middle text-green-600 font-medium">
                                            ${(invoice.amountPaid || 0).toFixed(2)}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                                                    invoice.status === 'Partial' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenPaymentModal(invoice)} disabled={invoice.status === 'Paid'}>
                                                    <CreditCard className="h-4 w-4 mr-2" /> Pay
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => navigate(`/invoices/${invoice.id}/edit`)}>
                                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => generatePDF(invoice)}>
                                                    <Download className="h-4 w-4 mr-2" /> PDF
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                        No invoices found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border">
                        <h2 className="text-xl font-semibold mb-4">Record Payment</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Invoice #{selectedInvoice?.number} - Total: ${selectedInvoice?.total.toFixed(2)}
                            <br />
                            Remaining: ${(selectedInvoice?.total - (selectedInvoice?.amountPaid || 0)).toFixed(2)}
                        </p>
                        <form onSubmit={handleSavePayment} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date</label>
                                <Input
                                    type="date"
                                    required
                                    value={paymentData.date}
                                    onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Method</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={paymentData.method}
                                    onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                                >
                                    <option>Bank Transfer</option>
                                    <option>Cash</option>
                                    <option>Credit Card</option>
                                    <option>Cheque</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Note</label>
                                <Input
                                    value={paymentData.note}
                                    onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                                    placeholder="Optional note"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Record Payment</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
