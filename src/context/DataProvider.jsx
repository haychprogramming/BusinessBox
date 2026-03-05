/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const [data, setData] = useState({
        clients: [],
        invoices: [],
        expenses: [], // Ensure expenses is initialized
        settings: {}, // Container for companyName, agencyLogo, etc.
        // Flattened settings for backward compatibility if needed, 
        // but ideally we migrate them into 'settings' object.
        // For now, let's support both or decide on a structure.
        // The server init gives { clients: [], invoices: [], settings: {}, expenses: [] }
        companyName: 'My Agency',
        agencyLogo: '',
        agencyAddress: '',
        agencyEmail: '',
        agencyPhone: '',
        financialYearStart: 'Jan'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial Fetch
    useEffect(() => {
        fetch('/api/data')
            .then(res => res.json())
            .then(serverData => {
                // Merge server data with defaults
                setData(prev => ({
                    ...prev,
                    ...serverData,
                    // Map legacy flat settings if they exist in serverData to top level
                    // or just use serverData structure.
                    // Let's assume serverData is the source of truth.
                }));
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch data:', err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Generic update function (replaces useLocalStorage setter)
    // key: 'clients' | 'invoices' | 'companyName' ...
    const updateData = (key, value) => {
        setData(prev => {
            const newData = { ...prev, [key]: value };

            // Optimistic update
            // Debounce save or save immediately? 
            // For this app, save immediate is likely fine, or we can add a 'save' method.
            // But useLocalStorage implies auto-save usually.
            // However, the new Settings page usage puts 'save' on a button.
            // Other pages (Clients, Invoices) usually auto-save.

            // Let's persist immediately for everything EXCEPT settings which might handle it manually?
            // Actually, if we use this for everything, we should persist.

            persistData(newData);
            return newData;
        });
    };

    const persistData = async (newData) => {
        try {
            await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
        } catch (err) {
            console.error('Failed to save data:', err);
            // Optionally set error state or show toast
        }
    };

    return (
        <DataContext.Provider value={{ data, updateData, loading, error }}>
            {children}
        </DataContext.Provider>
    );
};
