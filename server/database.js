import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../data/businessbox.db');

// Enable verbose mode for debugging
const sqlite = sqlite3.verbose();

const db = new sqlite.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initSchema();
    }
});

function initSchema() {
    db.serialize(() => {
        // Clients Table
        db.run(`CREATE TABLE IF NOT EXISTS clients (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            phone TEXT,
            company TEXT,
            address TEXT,
            logo TEXT,
            status TEXT
        )`);

        // Invoices Table
        db.run(`CREATE TABLE IF NOT EXISTS invoices (
            id TEXT PRIMARY KEY,
            number TEXT,
            clientId TEXT,
            date TEXT,
            dueDate TEXT,
            status TEXT,
            notes TEXT,
            total REAL,
            amountPaid REAL,
            FOREIGN KEY(clientId) REFERENCES clients(id)
        )`);

        // Invoice Items Table (One-to-Many)
        db.run(`CREATE TABLE IF NOT EXISTS invoice_items (
            id TEXT PRIMARY KEY,
            invoiceId TEXT,
            description TEXT,
            qty REAL,
            price REAL,
            FOREIGN KEY(invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
        )`);

        // Payments Table (One-to-Many)
        db.run(`CREATE TABLE IF NOT EXISTS payments (
            id TEXT PRIMARY KEY,
            invoiceId TEXT,
            amount REAL,
            date TEXT,
            method TEXT,
            note TEXT,
            FOREIGN KEY(invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
        )`);

        // Expenses Table
        db.run(`CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY,
            description TEXT,
            amount REAL,
            category TEXT,
            date TEXT,
            attachment TEXT
        )`);

        // Settings Table (Key-Value Store for simplicity)
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )`);
    });
}

// Helper to wrap db.all in Promise
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Helper to wrap db.run in Promise
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

// --- DATA ACCESS METHODS ---

// Get ALL data formatted as the frontend expects (JSON tree)
export const getData = async () => {
    try {
        const clients = await query('SELECT * FROM clients');
        const invoices = await query('SELECT * FROM invoices');
        const expenses = await query('SELECT * FROM expenses');
        const settingsRows = await query('SELECT * FROM settings');

        // Reconstruct Settings Object
        const settings = {};
        settingsRows.forEach(row => {
            settings[row.key] = row.value;
        });

        // Hydrate Invoices with Items and Payments
        const fullInvoices = await Promise.all(invoices.map(async (inv) => {
            const items = await query('SELECT * FROM invoice_items WHERE invoiceId = ?', [inv.id]);
            const payments = await query('SELECT * FROM payments WHERE invoiceId = ?', [inv.id]);
            return { ...inv, items, payments };
        }));

        return {
            clients,
            invoices: fullInvoices,
            expenses,
            // Flatten settings into root for backward compatibility with frontend structure
            ...settings
        };
    } catch (err) {
        console.error('Error fetching data:', err);
        return { clients: [], invoices: [], expenses: [] };
    }
};

// FULL SYNC function: Replaces DB content with incoming JSON (Transactional)
export const saveData = async (data) => {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            try {
                // START TRANSACTION
                await run('BEGIN TRANSACTION');

                // 1. Clients
                if (data.clients) {
                    await run('DELETE FROM clients'); // Clear table
                    const stmt = db.prepare('INSERT INTO clients (id, name, email, phone, company, address, logo, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
                    data.clients.forEach(c => {
                        stmt.run(c.id, c.name, c.email, c.phone, c.company, c.address, c.logo, c.status || 'Active');
                    });
                    stmt.finalize();
                }

                // 2. Expenses
                if (data.expenses) {
                    await run('DELETE FROM expenses');
                    const stmt = db.prepare('INSERT INTO expenses (id, description, amount, category, date, attachment) VALUES (?, ?, ?, ?, ?, ?)');
                    data.expenses.forEach(e => {
                        stmt.run(e.id, e.description, e.amount, e.category, e.date, e.attachment);
                    });
                    stmt.finalize();
                }

                // 3. Invoices (Complex)
                if (data.invoices) {
                    await run('DELETE FROM invoices');
                    await run('DELETE FROM invoice_items');
                    await run('DELETE FROM payments');

                    const invStmt = db.prepare('INSERT INTO invoices (id, number, clientId, date, dueDate, status, notes, total, amountPaid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
                    const itemStmt = db.prepare('INSERT INTO invoice_items (id, invoiceId, description, qty, price) VALUES (?, ?, ?, ?, ?)');
                    const payStmt = db.prepare('INSERT INTO payments (id, invoiceId, amount, date, method, note) VALUES (?, ?, ?, ?, ?, ?)');

                    data.invoices.forEach(inv => {
                        invStmt.run(inv.id, inv.number, inv.clientId, inv.date, inv.dueDate, inv.status, inv.notes, inv.total, inv.amountPaid || 0);

                        // Items
                        if (inv.items) {
                            inv.items.forEach((item, idx) => {
                                // Generate ID if missing (migration support)
                                const itemId = item.id || `${inv.id}_item_${idx}`;
                                itemStmt.run(itemId, inv.id, item.description, item.qty, item.price);
                            });
                        }

                        // Payments
                        if (inv.payments) {
                            inv.payments.forEach((pay, idx) => {
                                const payId = pay.id || `${inv.id}_pay_${idx}`;
                                payStmt.run(payId, inv.id, pay.amount, pay.date, pay.method, pay.note);
                            });
                        }
                    });
                    invStmt.finalize();
                    itemStmt.finalize();
                    payStmt.finalize();
                }

                // 4. Settings (Top-level keys in payload)
                // We define specific keys to save as settings
                const settingKeys = ['companyName', 'agencyLogo', 'agencyAddress', 'agencyEmail', 'agencyPhone', 'financialYearStart'];
                await run('DELETE FROM settings');
                const setStmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
                settingKeys.forEach(key => {
                    if (data[key] !== undefined) {
                        setStmt.run(key, String(data[key]));
                    }
                });
                setStmt.finalize();

                // COMMIT TRANSACTION
                await run('COMMIT');
                resolve(true);

            } catch (err) {
                await run('ROLLBACK');
                console.error('Transaction failed:', err);
                reject(err);
            }
        });
    });
};

export const getDbPath = () => DB_PATH;
