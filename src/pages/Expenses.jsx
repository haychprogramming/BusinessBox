import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, Search, Trash2, DollarSign, Calendar, Paperclip, Pencil, ExternalLink, Wallet } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import { Card, CardContent } from '../components/Card';
import { getFinancialYear, getAllFinancialYears } from '../utils/dateUtils';

export default function Expenses() {
    const [expenses, setExpenses] = useLocalStorage('expenses', []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [fyFilter, setFyFilter] = useState('All');
    const [financialYearStart] = useLocalStorage('financialYearStart', 'Jan');
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'General',
        date: new Date().toISOString().split('T')[0],
        attachment: null
    });

    const handleOpenModal = (expense = null) => {
        if (expense) {
            setEditingId(expense.id);
            setFormData(expense);
        } else {
            setEditingId(null);
            setFormData({
                description: '',
                amount: '',
                category: 'General',
                date: new Date().toISOString().split('T')[0],
                attachment: null
            });
        }
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, attachment: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(formData.amount);
        if (editingId) {
            setExpenses(expenses.map(e =>
                e.id === editingId ? { ...formData, id: editingId, amount } : e
            ));
        } else {
            const newExpense = {
                id: Date.now().toString(),
                ...formData,
                amount
            };
            setExpenses([newExpense, ...expenses]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            setExpenses(expenses.filter(e => e.id !== id));
        }
    };

    const filteredExpenses = expenses.filter(e => {
        const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
        const matchesDate = !dateFilter || e.date === dateFilter;
        const matchesFY = fyFilter === 'All' || getFinancialYear(e.date, financialYearStart) === fyFilter;
        return matchesSearch && matchesCategory && matchesDate && matchesFY;
    });

    const availableYears = getAllFinancialYears(expenses, 'date', financialYearStart);

    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    return (
        <PageContainer className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <Wallet className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Expenses</h1>
                        <p className="text-muted-foreground">Track your business spending.</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenModal(null)} size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-shadow">
                    <Plus className="mr-2 h-5 w-5" /> Add Expense
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Expenses</h3>
                        <div className="p-2 bg-primary/10 rounded-full">
                            <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold">${totalExpenses.toFixed(2)}</div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search expenses..."
                        className="pl-9 h-10 rounded-full bg-background/50 backdrop-blur-sm border-muted focus-visible:ring-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="h-10 rounded-full border border-muted bg-background/50 backdrop-blur-sm px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all hover:bg-background/80"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    <option value="General">General</option>
                    <option value="Software">Software</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Office">Office</option>
                    <option value="Travel">Travel</option>
                </select>
                <select
                    className="h-10 rounded-full border border-muted bg-background/50 backdrop-blur-sm px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all hover:bg-background/80"
                    value={fyFilter}
                    onChange={(e) => setFyFilter(e.target.value)}
                >
                    <option value="All">All Financial Years</option>
                    {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <Input
                    type="date"
                    className="w-auto rounded-full bg-background/50 backdrop-blur-sm h-10"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                />
            </div>

            <div>
                <Card className="border-border/50 shadow-sm">
                    <CardContent className="p-0">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Description</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Category</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Amount</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Attachment</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.length > 0 ? (
                                        filteredExpenses.map((expense) => (
                                            <tr key={expense.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle flex items-center gap-2">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    {expense.date}
                                                </td>
                                                <td className="p-4 align-middle font-medium">{expense.description}</td>
                                                <td className="p-4 align-middle">
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                                                        {expense.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle">${expense.amount.toFixed(2)}</td>
                                                <td className="p-4 align-middle">
                                                    {expense.attachment && (
                                                        <a
                                                            href={expense.attachment}
                                                            download={`expense-${expense.id}`}
                                                            className="inline-flex items-center text-blue-600 hover:underline"
                                                            title="Download Attachment"
                                                        >
                                                            <Paperclip className="h-4 w-4 mr-1" />
                                                            Attachment
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(expense)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(expense.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-muted-foreground">No expenses recorded.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border">
                        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Expense' : 'Add Expense'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>General</option>
                                    <option>Software</option>
                                    <option>Marketing</option>
                                    <option>Office</option>
                                    <option>Travel</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date</label>
                                <Input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Attachment (PDF/Image)</label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept=".pdf,image/*"
                                        onChange={handleFileChange}
                                        className="cursor-pointer"
                                    />
                                    {formData.attachment && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            title="Remove Attachment"
                                            onClick={() => setFormData(prev => ({ ...prev, attachment: null }))}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                                {formData.attachment && <p className="text-xs text-green-600">File attached</p>}
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">{editingId ? 'Update' : 'Add Expense'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
