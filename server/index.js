import express from 'express';
import cors from 'cors';
import process from 'process';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/db.json'); // Keep for legacy or cleanup later

const app = express();
const PORT = process.env.PORT || 3000;

import { getData, saveData, getDbPath } from './database.js';

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../dist')));

// API Endpoints
app.get('/api/data', async (req, res) => {
    const data = await getData();
    res.json(data);
});

app.post('/api/data', async (req, res) => {
    try {
        await saveData(req.body);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/api/backup', (req, res) => {
    const dbPath = getDbPath();
    res.download(dbPath, 'businessbox.db');
});

// Serve React App
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
