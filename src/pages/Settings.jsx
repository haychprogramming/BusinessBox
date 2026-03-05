import { Button } from '../components/Button';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Download, Upload, Trash2, AlertTriangle, Save, SettingsIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import PageContainer from '../components/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';

export default function Settings() {
    // Persistent Store Access
    const [savedClients, setClients] = useLocalStorage('clients', []);
    const [savedInvoices, setInvoices] = useLocalStorage('invoices', []);
    const [savedCompanyName, setCompanyName] = useLocalStorage('companyName', 'My Agency');
    const [savedAgencyLogo, setAgencyLogo] = useLocalStorage('agencyLogo', '');
    const [savedAgencyAddress, setAgencyAddress] = useLocalStorage('agencyAddress', '');
    const [savedAgencyEmail, setAgencyEmail] = useLocalStorage('agencyEmail', '');
    const [savedAgencyPhone, setAgencyPhone] = useLocalStorage('agencyPhone', '');
    const [savedFinancialYearStart, setFinancialYearStart] = useLocalStorage('financialYearStart', 'Jan');
    const [savedInvoiceTheme, setInvoiceTheme] = useLocalStorage('invoiceTheme', 'Standard');

    // Local Form State
    const [formData, setFormData] = useState({
        companyName: savedCompanyName,
        agencyLogo: savedAgencyLogo,
        agencyAddress: savedAgencyAddress,
        agencyEmail: savedAgencyEmail,
        agencyPhone: savedAgencyPhone,
        financialYearStart: savedFinancialYearStart,
        invoiceTheme: savedInvoiceTheme
    });

    // Sync form with storage on mount (or if storage updates externally)
    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                companyName: savedCompanyName,
                agencyLogo: savedAgencyLogo,
                agencyAddress: savedAgencyAddress,
                agencyEmail: savedAgencyEmail,
                agencyPhone: savedAgencyPhone,
                financialYearStart: savedFinancialYearStart,
                invoiceTheme: savedInvoiceTheme
            });
        }
        return () => { isMounted = false; };
    }, [savedCompanyName, savedAgencyLogo, savedAgencyAddress, savedAgencyEmail, savedAgencyPhone, savedFinancialYearStart, savedInvoiceTheme]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setCompanyName(formData.companyName);
        setAgencyLogo(formData.agencyLogo);
        setAgencyAddress(formData.agencyAddress);
        setAgencyEmail(formData.agencyEmail);
        setAgencyPhone(formData.agencyPhone);
        setFinancialYearStart(formData.financialYearStart);
        setInvoiceTheme(formData.invoiceTheme);
        alert('Settings saved successfully!');
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('agencyLogo', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExport = () => {
        const data = {
            clients: savedClients,
            invoices: savedInvoices,
            settings: {
                companyName: savedCompanyName,
                agencyLogo: savedAgencyLogo,
                agencyAddress: savedAgencyAddress,
                agencyEmail: savedAgencyEmail,
                agencyPhone: savedAgencyPhone,
                financialYearStart: savedFinancialYearStart,
                invoiceTheme: savedInvoiceTheme
            }
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `businessbox_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (window.confirm('This will overwrite current data. Continue?')) {
                        if (data.clients) setClients(data.clients);
                        if (data.invoices) setInvoices(data.invoices);
                        if (data.settings) {
                            setCompanyName(data.settings.companyName || 'My Agency');
                            setAgencyLogo(data.settings.agencyLogo || '');
                            setAgencyAddress(data.settings.agencyAddress || '');
                            setAgencyEmail(data.settings.agencyEmail || '');
                            setAgencyPhone(data.settings.agencyPhone || '');
                            setFinancialYearStart(data.settings.financialYearStart || 'Jan');
                            setInvoiceTheme(data.settings.invoiceTheme || 'Standard');
                            // Updates will flow back via useEffect
                        }
                        alert('Data imported successfully!');
                    }
                } catch {
                    alert('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleClearData = () => {
        if (window.confirm('Are you ABSOLUTELY sure? This cannot be undone.')) {
            setClients([]);
            setInvoices([]);
            alert('All data cleared.');
        }
    };

    return (
        <PageContainer className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <SettingsIcon className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground">Manage your application preferences and data.</p>
                    </div>
                </div>
                <Button onClick={handleSave} size="lg" className="rounded-full shadow-md">
                    <Save className="mr-2 h-5 w-5" /> Save Changes
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Agency Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Agency Name</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.companyName}
                                onChange={(e) => handleChange('companyName', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Logo</label>
                            <div className="flex items-center gap-4">
                                {formData.agencyLogo && <img src={formData.agencyLogo} alt="Logo" className="h-12 w-12 object-contain border rounded" />}
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Button variant="outline" size="sm">Upload Logo</Button>
                                </div>
                                {formData.agencyLogo && <Button variant="ghost" size="sm" onClick={() => handleChange('agencyLogo', '')}><Trash2 className="h-4 w-4" /></Button>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Address</label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.agencyAddress}
                                onChange={(e) => handleChange('agencyAddress', e.target.value)}
                                placeholder="123 Agency St, City, Country"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <input
                                type="email"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.agencyEmail}
                                onChange={(e) => handleChange('agencyEmail', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <input
                                type="tel"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.agencyPhone}
                                onChange={(e) => handleChange('agencyPhone', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Financial Year Format</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.financialYearStart}
                                onChange={(e) => handleChange('financialYearStart', e.target.value)}
                            >
                                <option value="Jan">Calendar Year (Jan - Dec)</option>
                                <option value="Jul">Australian Financial Year (Jul - Jun)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Invoice Theme</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.invoiceTheme}
                                onChange={(e) => handleChange('invoiceTheme', e.target.value)}
                            >
                                <option value="Standard">Standard</option>
                                <option value="Modern">Modern</option>
                                <option value="Minimal">Minimal</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Download className="h-4 w-4" /> Export Data
                                </h3>
                                <p className="text-sm text-muted-foreground">Download a JSON backup of all your clients and invoices.</p>
                                <Button variant="outline" onClick={handleExport} className="w-full mt-2">
                                    Export Backup
                                </Button>
                            </div>

                            <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Upload className="h-4 w-4" /> Import Data
                                </h3>
                                <p className="text-sm text-muted-foreground">Restore from a previously exported JSON file.</p>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleImport}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Button variant="outline" className="w-full mt-2">
                                        Select File
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t">
                            <h3 className="text-red-600 font-medium flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4" /> Danger Zone
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">Permanently remove all local data from this browser.</p>
                            <Button variant="destructive" onClick={handleClearData}>
                                <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}
