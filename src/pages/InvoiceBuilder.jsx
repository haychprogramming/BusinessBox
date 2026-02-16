import { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';

export default function InvoiceBuilder() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [invoices, setInvoices] = useLocalStorage('invoices', []);
    const [clients] = useLocalStorage('clients', []);

    const [invoiceData, setInvoiceData] = useState({
        clientId: '',
        number: `INV-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ id: 1, description: 'Service', qty: 1, price: 100 }],
        status: 'Pending'
    });

    useEffect(() => {
        if (id) {
            const invoiceToEdit = invoices.find(inv => inv.id === id);
            if (invoiceToEdit) {
                setInvoiceData(invoiceToEdit);
            }
        }
    }, [id, invoices]);

    // ... handleItemChange, addItem, removeItem, calculateTotal (keep existing logic) ...
    const handleItemChange = (itemId, field, value) => {
        const newItems = invoiceData.items.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
        );
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const addItem = () => {
        setInvoiceData({
            ...invoiceData,
            items: [...invoiceData.items, { id: Date.now(), description: 'New Item', qty: 1, price: 0 }]
        });
    };

    const removeItem = (itemId) => {
        setInvoiceData({
            ...invoiceData,
            items: invoiceData.items.filter(item => item.id !== itemId)
        });
    };

    const calculateTotal = () => {
        return invoiceData.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    };

    const handleSave = () => {
        if (!invoiceData.clientId) {
            alert('Please select a client');
            return;
        }

        const total = calculateTotal();

        if (id) {
            // Update existing
            const updatedInvoices = invoices.map(inv =>
                inv.id === id ? { ...invoiceData, total } : inv
            );
            setInvoices(updatedInvoices);
        } else {
            // Create new
            const newInvoice = {
                ...invoiceData,
                id: Date.now().toString(),
                total
            };
            setInvoices([...invoices, newInvoice]);
        }
        navigate('/invoices');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{id ? 'Edit Invoice' : 'New Invoice'}</h1>
                <div className="space-x-2">
                    <Button variant="outline" onClick={() => navigate('/invoices')}>Cancel</Button>
                    <Button onClick={handleSave}>Save Invoice</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4 rounded-lg border bg-card p-6">
                    <h2 className="text-lg font-semibold">Invoice Details</h2>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Invoice Number</label>
                        <Input
                            value={invoiceData.number}
                            onChange={(e) => setInvoiceData({ ...invoiceData, number: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <Input
                                type="date"
                                value={invoiceData.date}
                                onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Due Date</label>
                            <Input
                                type="date"
                                value={invoiceData.dueDate}
                                onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 rounded-lg border bg-card p-6">
                    <h2 className="text-lg font-semibold">Client</h2>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Client</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={invoiceData.clientId}
                            onChange={(e) => setInvoiceData({ ...invoiceData, clientId: e.target.value })}
                        >
                            <option value="">Select a client...</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Could show client details preview here */}
                </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Items</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                        <div className="col-span-6">Description</div>
                        <div className="col-span-2">Qty</div>
                        <div className="col-span-2">Price</div>
                        <div className="col-span-1">Total</div>
                        <div className="col-span-1"></div>
                    </div>

                    {invoiceData.items.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-6">
                                <Input
                                    value={item.description}
                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                />
                            </div>
                            <div className="col-span-2">
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.qty}
                                    onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="col-span-2">
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.price}
                                    onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="col-span-1 text-sm font-medium pt-2">
                                ${(item.qty * item.price).toFixed(2)}
                            </div>
                            <div className="col-span-1 text-right">
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeItem(item.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    <Button variant="outline" onClick={addItem} className="w-full mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>

                <div className="flex justify-end mt-8">
                    <div className="w-64 space-y-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
