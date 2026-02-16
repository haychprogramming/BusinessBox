import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import PageContainer from '../components/PageContainer';

export default function Clients() {
    const [clients, setClients] = useLocalStorage('clients', []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingClient, setEditingClient] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'Active'
    });

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenModal = (client = null) => {
        if (client) {
            setEditingClient(client);
            setFormData(client);
        } else {
            setEditingClient(null);
            setFormData({ name: '', email: '', phone: '', company: '', status: 'Active' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingClient) {
            setClients(clients.map(c => c.id === editingClient.id ? { ...formData, id: c.id } : c));
        } else {
            setClients([...clients, { ...formData, id: Date.now().toString() }]);
        }
        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            setClients(clients.filter(c => c.id !== id));
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageContainer className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-muted-foreground">Manage your client base and relationships.</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Client
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Company</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Contact</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{client.name}</td>
                                        <td className="p-4 align-middle">{client.company}</td>
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span>{client.email}</span>
                                                <span className="text-xs text-muted-foreground">{client.phone}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenModal(client)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(client.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                        No clients found. Add one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Company</label>
                                <Input
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Client Logo</label>
                                <div className="flex items-center gap-4">
                                    {formData.logo && (
                                        <img src={formData.logo} alt="Preview" className="h-10 w-10 object-contain border rounded" />
                                    )}
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <Button type="button" variant="outline" size="sm">
                                            {formData.logo ? 'Change Logo' : 'Upload Logo'}
                                        </Button>
                                    </div>
                                    {formData.logo && (
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setFormData({ ...formData, logo: '' })}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone</label>
                                <Input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Lead">Lead</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                                <Button type="submit">{editingClient ? 'Update' : 'Create'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
