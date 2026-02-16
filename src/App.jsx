import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';

import Clients from './pages/Clients';

// Placeholder components
import Invoices from './pages/Invoices';
import InvoiceBuilder from './pages/InvoiceBuilder';
import ClientPortal from './pages/ClientPortal';
import Settings from './pages/Settings';
import Expenses from './pages/Expenses';

import { DataProvider } from './context/DataProvider';

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/portal" element={<ClientPortal />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/new" element={<InvoiceBuilder />} />
            <Route path="invoices/:id/edit" element={<InvoiceBuilder />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<div className="p-4">Not Found</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
