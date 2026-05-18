
import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import Database from 'better-sqlite3';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});
  const PORT = 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));
app.use(express.json({ limit: '50mb' }));

app.use('/api', (req, res, next) => {
  console.log('🔥 API HIT:', req.method, req.url);
  next();
});

  // Initialize SQLite Database
  const dbPath = fs.existsSync(path.join(process.cwd(), 'electron', 'database.sqlite'))
    ? path.join(process.cwd(), 'electron', 'database.sqlite')
    : path.join(process.cwd(), 'ledger.db');
  const db = new Database(dbPath);
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (id TEXT PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS clients (id TEXT PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS kissans (id TEXT PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS investors (id TEXT PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS loans (id TEXT PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS properties (id TEXT PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS referrals (id TEXT PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS docs (
      id TEXT PRIMARY KEY,
      name TEXT,
      date TEXT,
      size TEXT,
      type TEXT,
      synced INTEGER DEFAULT 0,
      category TEXT,
      propertyId TEXT,
      clientId TEXT,
      kissanId TEXT,
      ownerId TEXT,
      investorId TEXT,
      loanId TEXT,
      fileData TEXT,
      data TEXT,
      folder_id TEXT,
      category_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS folders (id TEXT PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS master_properties (id TEXT PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);
    CREATE TABLE IF NOT EXISTS banks (id TEXT PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS staff (id TEXT PRIMARY KEY, data TEXT);
  `);

  // --- Database Migration ---
  try {
    const tableInfoDocs = db.prepare("PRAGMA table_info(docs)").all() as any[];
    const hasDataDocs = tableInfoDocs.some(col => col.name === 'data');
    if (!hasDataDocs) {
      console.log('Migrating: Adding data column to docs table');
      db.exec("ALTER TABLE docs ADD COLUMN data TEXT");
    }

    const tableInfoFolders = db.prepare("PRAGMA table_info(folders)").all() as any[];
    const hasDataFolders = tableInfoFolders.some(col => col.name === 'data');
    if (!hasDataFolders) {
      console.log('Migrating: Adding data column to folders table');
      db.exec("ALTER TABLE folders ADD COLUMN data TEXT");
    }
  } catch (migError) {
    console.error('Database migration failed (might be semi-corrupt or busy):', migError);
    // If it's specifically about 'data' column missing but ALTER fails, we might be in trouble
    // but at least we don't crash the whole server
  }

  // --- API ROUTES ---

  // Centralized ID Generation Engine
  app.post('/api/generate-id', (req, res) => {
    try {
      const { prefix, date } = req.body;
      if (!prefix) return res.status(400).json({ error: 'Prefix is required' });

      // Use provided date or fallback to current date
      const now = date ? new Date(date) : new Date();
      if (isNaN(now.getTime())) return res.status(400).json({ error: 'Invalid date provided' });

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;

      // Use a transaction for serial increment to ensure absolute uniqueness across all record types
      const getAndIncrement = db.transaction(() => {
        const row = db.prepare("SELECT current_serial FROM global_id_counter WHERE id = 'main'").get() as any;
        const nextSerial = (row?.current_serial || 784) + 1;
        db.prepare("UPDATE global_id_counter SET current_serial = ? WHERE id = 'main'").run(nextSerial);
        return nextSerial;
      });

      const serial = getAndIncrement();
      const serialStr = String(serial).padStart(5, '0');
      const companyCode = 'AG';
      const generatedId = `${prefix}/${companyCode}/${dateStr}/${serialStr}`;

      console.log(`Generated Centralized ID: ${generatedId} for date: ${dateStr}`);
      res.json({ id: generatedId, serial });
    } catch (err) {
      console.error('❌ ID GENERATION ENGINE ERROR:', err);
      res.status(500).json({ error: 'ID Generation Engine Failure' });
    }
  });

   // Peek at the NEXT ID without incrementing
  app.post('/api/peek-id', (req, res) => {
    try {
      const { prefix, date } = req.body;
      if (!prefix) return res.status(400).json({ error: 'Prefix is required' });

      const now = date ? new Date(date) : new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;

      const row = db.prepare("SELECT current_serial FROM global_id_counter WHERE id = 'main'").get() as any;
      const nextSerial = (row?.current_serial || 784) + 1;
      const serialStr = String(nextSerial).padStart(5, '0');
      const companyCode = 'AG';
      const generatedId = `${prefix}/${companyCode}/${dateStr}/${serialStr}`;

      res.json({ id: generatedId, serial: nextSerial });
    } catch {
      res.status(500).json({ error: 'Peak Engine Failure' });
    }
  });

  // Settings
  app.get('/api/settings', (req, res) => {
  try {
    const row = db.prepare("SELECT data FROM settings WHERE id = 'main'").get() as any;

    if (!row || !row.data) {
      return res.json({});
    }

    let parsed;
    try {
      parsed = JSON.parse(row.data);
    } catch {
      console.error('❌ JSON PARSE FAILED:', row.data);
      return res.json({});
    }

    res.json(parsed);
  } catch (err) {
    console.error('❌ GET SETTINGS ERROR:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});
  app.post('/api/settings', (req, res) => {
  try {
    const cleanData = JSON.stringify(req.body || {});

    db.prepare(`
      INSERT OR REPLACE INTO settings (id, data)
      VALUES (?, ?)
    `).run('main', cleanData);

    res.json({ status: 'success' });
  } catch (_e) {
    console.error('❌ Error saving settings:', _e);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

  // Reset Ledger
  app.post('/api/reset-ledger', (req, res) => {
    try {
      // Clear all tables except settings
      const tables = ['clients', 'kissans', 'investors', 'loans', 'properties', 'transactions', 'referrals', 'docs', 'folders', 'master_properties', 'categories', 'banks', 'staff'];
      tables.forEach(table => {
        db.prepare(`DELETE FROM ${table}`).run();
      });
      res.json({ status: 'success' });
    } catch (err) {
      console.error('❌ RESET LEDGER ERROR:', err);
      res.status(500).json({ error: 'Failed to reset ledger' });
    }
  });

  app.post('/api/sync-to-website', async (req, res) => {
    try {
      const settingsRow = db.prepare("SELECT data FROM settings WHERE id = 'main'").get() as any;
      let settings = {} as any;
      if (settingsRow && settingsRow.data) {
        settings = JSON.parse(settingsRow.data);
      }
      const rawBackendUrl = settings.backendUrl || process.env.BACKEND_URL || 'https://ashray-backend-2nt7.onrender.com';
      const backendUrl = rawBackendUrl.endsWith('/') ? rawBackendUrl.slice(0, -1) : rawBackendUrl;
      
      const getTableData = (table: string) => {
          return db.prepare(`SELECT data FROM ${table}`).all().map((r: any) => JSON.parse(r.data));
      };

      const clients = getTableData('clients');
      const investors = getTableData('investors');
      const properties = getTableData('properties');
      const docs = getTableData('docs').filter((d: any) => d.category !== 'REPORT' && d.type !== 'virtual').map(({ data: _data, ...rest }) => rest);
      const transactions = getTableData('transactions');
      const referrals = getTableData('referrals');

      // Health check with retry for Render cold starts
      const waitForBackend = async (maxRetries = 10, delayMs = 5000) => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            const ctrl = new AbortController();
            const timeout = setTimeout(() => ctrl.abort(), 10000);
            const r = await fetch(`${backendUrl}/api/health`, { signal: ctrl.signal });
            clearTimeout(timeout);
            if (r.ok) return true;
          } catch {}
          if (i < maxRetries - 1) {
            console.log(`⏳ Backend not ready, retrying in ${delayMs/1000}s... (${i+1}/${maxRetries})`);
            await new Promise(r => setTimeout(r, delayMs));
          }
        }
        return false;
      };

      const backendReady = await waitForBackend();
      if (!backendReady) {
        return res.json({ success: false, message: 'Backend not reachable. Render may be spinning up — try again in 1-2 minutes.' });
      }

      // Helper to push data with retry
      const push = async (path: string, data: any[], retries = 3) => {
        if (data.length === 0) return { status: 'skipped', count: 0 };
        for (let i = 0; i < retries; i++) {
          try {
            const ctrl = new AbortController();
            const timeout = setTimeout(() => ctrl.abort(), 30000);
            const resp = await fetch(`${backendUrl}${path}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
              signal: ctrl.signal
            });
            clearTimeout(timeout);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
            return resp.json();
          } catch (e) {
            if (i < retries - 1) {
              console.log(`⏳ Retry ${i+1}/${retries} for ${path}...`);
              await new Promise(r => setTimeout(r, 3000));
            } else {
              throw e;
            }
          }
        }
      };

      // Chunked push for large payloads (e.g., docs with fileData)
      const pushChunked = async (path: string, data: any[], chunkSize = 5, retries = 3) => {
        if (!data || data.length === 0) return { status: 'skipped', count: 0 };
        let totalCount = 0;
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          const result = await push(path, chunk, retries);
          totalCount += result.count || chunk.length;
        }
        return { status: 'success', count: totalCount };
      };

      await Promise.all([
        push('/api/client/bulk-upsert', clients),
        push('/api/investor/bulk-upsert', investors),
        push('/api/property/bulk-upsert', properties),
        pushChunked('/api/doc/bulk-upsert', docs, 2),
        push('/api/transaction/bulk-upsert', transactions),
        push('/api/referral/bulk-upsert', referrals),
      ]);

      // Mark all pushed docs as synced locally
      const markSynced = db.prepare('UPDATE docs SET data = ? WHERE id = ?');
      for (const doc of docs) {
        markSynced.run(JSON.stringify({ ...doc, synced: true }), doc.id);
      }

      res.json({ success: true, message: `Successfully synced — ${clients.length} clients, ${properties.length} properties, ${transactions.length} transactions, ${docs.length} docs, ${referrals.length} referrals pushed.` });
    } catch (error) {
      console.error("Sync Error:", error);
      res.json({ success: false, message: error instanceof Error ? `Sync failed: ${error.message}` : "Sync failed" });
    }
  });

  // Generic CRUD helper
  const setupCrud = (name: string, tableName: string) => {
    app.get(`/api/${name}/all`, (req, res) => {
      try {
        const rows = db.prepare(`SELECT data FROM ${tableName}`).all() as any[];
        res.json(rows.map(r => { try { return JSON.parse(r.data); } catch { return r; } }).filter(c => !c.is_deleted));
      } catch {
        res.json([]);
      }
    });
    app.get(`/api/${name}/:id`, (req, res) => {
      try {
        const id = decodeURIComponent(req.params.id);
        const row = db.prepare(`SELECT data FROM ${tableName} WHERE id = ?`).get(id);
        res.json(row ? (() => { try { return JSON.parse(row.data); } catch { return row; } })() : null);
      } catch {
        res.json(null);
      }
    });
    app.post(`/api/${name}/upsert`, (req, res) => {
      try {
        const id = req.body.id;
        db.prepare(`INSERT OR REPLACE INTO ${tableName} (id, data) VALUES (?, ?)`).run(id, JSON.stringify(req.body));
        res.json({ status: 'success', id });
      } catch (e) {
        console.error(`❌ UPSERT ${name} ERROR:`, e);
        res.json({ status: 'error', error: String(e) });
      }
    });
    app.delete(`/api/${name}/delete/:id`, (req, res) => {
      try {
        db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).run(req.params.id);
        res.json({ status: 'deleted' });
      } catch (e) {
        console.error(`❌ DELETE ${name} ERROR:`, e);
        res.json({ status: 'error', error: String(e) });
      }
    });
    app.post(`/api/${name}/bulk-upsert`, (req, res) => {
      try {
        const items = req.body;
        const insert = db.prepare(`INSERT OR REPLACE INTO ${tableName} (id, data) VALUES (?, ?)`);
        const transaction = db.transaction((items) => {
          for (const item of items) insert.run(item.id, JSON.stringify(item));
        });
        transaction(items);
        res.json({ status: 'success', count: items.length });
      } catch (e) {
        console.error(`❌ BULK UPSERT ${name} ERROR:`, e);
        res.json({ status: 'error', error: String(e) });
      }
    });
  };

  setupCrud('client', 'clients');
  setupCrud('kissan', 'kissans');
  setupCrud('investor', 'investors');
  setupCrud('loan', 'loans');
  setupCrud('property', 'properties');
  setupCrud('transaction', 'transactions');
  setupCrud('referral', 'referrals');

  // Move document serving routes ABOVE setupCrud for 'doc' to avoid priority issues
  // Robust Doc Serving Endpoint
  app.get('/api/doc/serve/:id', (req, res) => {
    try {
      const id = decodeURIComponent(req.params.id);
      
      // Also check the 'documents' table if it exists
      const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='documents'").get();
      
      let row = db.prepare('SELECT * FROM docs WHERE id = ?').get(id) as any;
      
      if (!row && tableExists) {
        row = db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as any;
      }
      
      if (!row) {
        // Try selecting by parsing data column if ID is not in dedicated column (unlikely but safe)
        const allDocs = db.prepare('SELECT data FROM docs').all() as any[];
        for(const dRow of allDocs) {
          try {
            const parsed = JSON.parse(dRow.data);
            if (parsed.id === id) {
              row = { data: dRow.data, ...parsed };
              break;
            }
          } catch {
            // skip parse failure
          }
        }
      }

      if (!row) {
        console.error(`❌ DOC NOT FOUND: ${id}`);
        return res.status(404).sendFile(path.join(process.cwd(), 'dist', 'index.html')); // Fallback to index if 404 to avoid broken app if requested as main URL
      }

      let doc: any = {};
      if (row.data) {
        try {
          doc = JSON.parse(row.data);
        } catch {
          doc = row;
        }
      } else {
        doc = row;
      }

      // Check both 'fileData' (Electron schema) and 'content' (File Manager schema)
      const fileData = doc.fileData || doc.content || row.fileData || row.content;

      if (!fileData) {
        console.error(`❌ FILE DATA MISSING FOR: ${id}`);
        return res.status(404).send('File data missing');
      }

      let contentType = 'application/octet-stream';
      let base64Data = '';

      if (typeof fileData === 'string' && fileData.includes(',')) {
        const [header, data] = fileData.split(',');
        base64Data = data;
        const match = header.match(/data:(.*);base64/);
        if (match) contentType = match[1];
      } else if (fileData instanceof Buffer) {
        base64Data = fileData.toString('base64');
      } else {
        base64Data = fileData;
      }

      // Infer content type if still default
      if (contentType === 'application/octet-stream') {
        const ext = (doc.name || row.name || '').split('.').pop()?.toLowerCase();
        if (ext === 'pdf' || doc.type === 'pdf' || row.type === 'pdf') {
          contentType = 'application/pdf';
        } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '') || doc.type === 'img' || row.type === 'img') {
          contentType = `image/${ext === 'jpg' ? 'jpeg' : (ext || 'jpeg')}`;
        }
      }

      const buffer = Buffer.isBuffer(fileData) ? fileData : Buffer.from(base64Data, 'base64');

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.name || row.name || 'document')}"`);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache documents
      res.send(buffer);
    } catch (_err) {
      console.error('❌ DOC SERVE ERROR:', _err);
      res.status(500).json({ error: 'Internal server error serving document' });
    }
  });

  setupCrud('doc', 'docs');
  setupCrud('folder', 'folders');
  setupCrud('master-properties', 'master_properties');
  setupCrud('bank', 'banks');
  setupCrud('staff', 'staff');


  // Properties specific
  app.post('/api/property/update/:id', (req, res) => {
    const row = db.prepare('SELECT data FROM properties WHERE id = ?').get(req.params.id) as any;
    if (row) {
      const data = { ...JSON.parse(row.data), ...req.body };
      db.prepare('UPDATE properties SET data = ? WHERE id = ?').run(JSON.stringify(data), req.params.id);
    }
    res.json({ status: 'success' });
  });
  app.post('/api/property/assign', (req, res) => {
    const { propertyId, plotId, clientId, clientData } = req.body;
    const row = db.prepare('SELECT data FROM properties WHERE id = ?').get(propertyId) as any;
    if (row) {
      const p = JSON.parse(row.data);
      const plotIndex = p.inventory.findIndex((plot: any) => plot.id === plotId);
      if (plotIndex !== -1) {
        p.inventory[plotIndex] = {
          ...p.inventory[plotIndex],
          status: clientData.status,
          clientId: clientId,
          clientName: clientData.name,
          clientPhone: clientData.phone,
          amount: clientData.amount || p.inventory[plotIndex].price
        };
        db.prepare('UPDATE properties SET data = ? WHERE id = ?').run(JSON.stringify(p), propertyId);
      }
    }
    res.json({ status: 'success' });
  });

  app.post('/api/client/create', (req, res) => {
  try {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const dateStr = `${year}${month}${day}`;

    const base = 785;

    const transaction = db.transaction(() => {
      // 🔥 STRICT COUNT FROM DB (NOT API)
      const rows = db.prepare("SELECT id FROM clients").all() as any[];

      const todayCount = rows.filter(r => r.id.split('/')[2] === dateStr).length;

      const serial = String(base + todayCount).padStart(5, '0');

      const clientId = `CID/AG/${dateStr}/${serial}`;

      const data = {
        ...req.body,
        id: clientId
      };

      db.prepare(`
        INSERT INTO clients (id, data)
        VALUES (?, ?)
      `).run(clientId, JSON.stringify(data));

      return clientId;
    });

    const clientId = transaction();

    res.json({ success: true, clientId });

  } catch (err) {
    console.error('❌ CREATE CLIENT ERROR:', err);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

  app.get('/api/category/deleted', (req, res) => {
    try {
      const rows = db.prepare('SELECT data FROM categories').all() as any[];
      res.json(rows.map(r => { try { return JSON.parse(r.data); } catch { return r; } }).filter(c => c.is_deleted));
    } catch {
      res.json([]);
    }
  });

  // Categories
  app.get('/api/category/all', (req, res) => {
    try {
      const rows = db.prepare('SELECT data FROM categories').all() as any[];
      res.json(rows.map(r => JSON.parse(r.data)));
    } catch (e) {
      try {
        const rows = db.prepare('SELECT id, name, color, icon FROM categories').all() as any[];
        res.json(rows.map(r => ({ id: r.id, name: r.name, color: r.color, icon: r.icon })));
      } catch (e2) {
        res.json([]);
      }
    }
  });
  app.post('/api/category/upsert', (req, res) => {
    const data = req.body;
    if (data.id) {
      db.prepare('INSERT OR REPLACE INTO categories (id, data) VALUES (?, ?)').run(data.id, JSON.stringify(data));
    } else {
      const info = db.prepare('INSERT INTO categories (data) VALUES (?)').run(JSON.stringify(data));
      data.id = info.lastInsertRowid;
      db.prepare('UPDATE categories SET data = ? WHERE id = ?').run(JSON.stringify(data), data.id);
    }
    res.json(data);
  });
  app.post('/api/category/update/:id', (req, res) => {
    const row = db.prepare('SELECT data FROM categories WHERE id = ?').get(req.params.id) as any;
    if (row) {
      const data = { ...JSON.parse(row.data), ...req.body };
      db.prepare('UPDATE categories SET data = ? WHERE id = ?').run(JSON.stringify(data), req.params.id);
    }
    res.json({ status: 'success' });
  });
  app.post('/api/categories/:id/restore', (req, res) => {
    try {
      const row = db.prepare('SELECT data FROM categories WHERE id = ?').get(req.params.id) as any;
      if (row && row.data) {
        try {
          const data = JSON.parse(row.data);
          data.is_deleted = 0;
          delete data.deleted_at;
          db.prepare('UPDATE categories SET data = ? WHERE id = ?').run(JSON.stringify(data), req.params.id);
        } catch (parseErr) {
          console.error('❌ CATEGORY RESTORE PARSE ERROR:', parseErr);
        }
      }
      res.json({ status: 'success' });
    } catch (e) {
      console.error('❌ CATEGORY RESTORE ERROR:', e);
      res.json({ status: 'success' });
    }
  });
  app.delete('/api/category/delete/:id', (req, res) => {
    const row = db.prepare('SELECT data FROM categories WHERE id = ?').get(req.params.id) as any;
    if (row) {
      const data = JSON.parse(row.data);
      data.is_deleted = 1;
      data.deleted_at = new Date().toISOString();
      db.prepare('UPDATE categories SET data = ? WHERE id = ?').run(JSON.stringify(data), req.params.id);
    }
    res.json({ status: 'deleted (soft)' });
  });
  app.delete('/api/categories/:id', (req, res) => {
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ status: 'permanently deleted' });
  });

  // Legacy doc view endpoint
  app.get('/api/doc/view/:name', (req, res) => {
    try {
      const fileName = decodeURIComponent(req.params.name);
      const rows = db.prepare('SELECT data FROM docs').all() as any[];
      const doc = rows.map(r => JSON.parse(r.data)).find(d => d.name === fileName);
      if (doc && (doc.fileData || doc.content)) {
        const fileData = doc.fileData || doc.content;
        const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
        const buffer = Buffer.from(base64Data, 'base64');
        
        let contentType = doc.type === 'pdf' ? 'application/pdf' : 'image/jpeg';
        if (doc.type && doc.type.includes('/')) contentType = doc.type;
        
        res.contentType(contentType);
        res.send(buffer);
      } else {
        res.status(404).send('File not found');
      }
    } catch (err) {
      console.error('❌ DOC VIEW ERROR:', err);
      res.status(500).send('Internal server error');
    }
  });

  // Aliases for DataBase.tsx
  app.get('/api/categories', (req, res) => {
    try {
      const rows = db.prepare('SELECT data FROM categories').all() as any[];
      res.json(rows.map(r => { try { return JSON.parse(r.data); } catch { return r; } }));
    } catch {
      res.json([]);
    }
  });
  app.post('/api/categories', (req, res) => {
    const data = req.body;
    const info = db.prepare('INSERT INTO categories (data) VALUES (?)').run(JSON.stringify(data));
    data.id = info.lastInsertRowid;
    db.prepare('UPDATE categories SET data = ? WHERE id = ?').run(JSON.stringify(data), data.id);
    res.json(data);
  });
  app.get('/api/folders', (req, res) => {
    try {
      const rows = db.prepare('SELECT data FROM folders').all() as any[];
      res.json(rows.map(r => { try { return JSON.parse(r.data); } catch { return r; } }));
    } catch {
      res.json([]);
    }
  });
  app.get('/api/folder/all', (req, res) => {
    try {
      const rows = db.prepare('SELECT data FROM folders').all() as any[];
      res.json(rows.map(r => { try { return JSON.parse(r.data); } catch { return r; } }));
    } catch {
      res.json([]);
    }
  });
  app.get('/api/folders/:id', (req, res) => {
    try {
      const id = decodeURIComponent(req.params.id);
      const row = db.prepare('SELECT data FROM folders WHERE id = ?').get(id);
      res.json(row ? (() => { try { return JSON.parse(row.data); } catch { return row; } })() : null);
    } catch {
      res.json(null);
    }
  });
  app.post('/api/folders', (req, res) => {
    const id = req.body.id;
    db.prepare('INSERT OR REPLACE INTO folders (id, data) VALUES (?, ?)').run(id, JSON.stringify(req.body));
    res.json({ status: 'success', id });
  });
  app.patch('/api/folders/:id', (req, res) => {
    console.log(`PATCH /api/folders/${req.params.id} called with body:`, req.body);
    const row = db.prepare('SELECT data FROM folders WHERE id = ?').get(req.params.id) as any;
    console.log(`Row found:`, !!row);
    if (row) {
      const data = { ...JSON.parse(row.data), ...req.body };
      console.log(`Updating folder data to:`, data);
      db.prepare('UPDATE folders SET data = ? WHERE id = ?').run(JSON.stringify(data), req.params.id);
    }
    res.json({ status: 'success' });
  });
  app.get('/api/files', (req, res) => {
    try {
      const rows = db.prepare('SELECT data FROM docs').all() as any[];
      res.json(rows.map(r => { try { return JSON.parse(r.data); } catch { return r; } }));
    } catch {
      res.json([]);
    }
  });
  app.patch('/api/files/:id', (req, res) => {
    console.log(`PATCH /api/files/${req.params.id} called with body:`, req.body);
    const row = db.prepare('SELECT data FROM docs WHERE id = ?').get(req.params.id) as any;
    console.log(`Row found:`, !!row);
    if (row) {
      const data = { ...JSON.parse(row.data), ...req.body };
      console.log(`Updating file data to:`, data);
      db.prepare('UPDATE docs SET data = ? WHERE id = ?').run(JSON.stringify(data), req.params.id);
    }
    res.json({ status: 'success' });
  });
  app.post('/api/documents', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { name, type, folder_id, category_id } = req.body;
    const base64Data = req.file.buffer.toString('base64');
    const docId = `doc_${Date.now()}_${req.file.originalname}`;
    
    const docData = {
      id: docId,
      name: name || req.file.originalname,
      type: type || req.file.mimetype,
      size: req.file.size,
      folder_id: folder_id && folder_id !== 'null' ? folder_id : null,
      category_id: category_id && category_id !== 'null' ? category_id : null,
      is_starred: 0,
      is_deleted: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fileData: `data:${req.file.mimetype};base64,${base64Data}`
    };
    
    db.prepare('INSERT OR REPLACE INTO docs (id, data) VALUES (?, ?)').run(docId, JSON.stringify(docData));
    res.json(docData);
  });

   // Restore functionality
  app.post('/api/files/:id/restore', (req, res) => {
    const row = db.prepare('SELECT data FROM docs WHERE id = ?').get(req.params.id) as any;
    if (row) {
      const data = JSON.parse(row.data);
      data.is_deleted = 0;
      delete data.deleted_at;
      db.prepare('UPDATE docs SET data = ? WHERE id = ?').run(JSON.stringify(data), req.params.id);
    }
    res.json({ status: 'success' });
  });
  app.post('/api/folders/:id/restore', (req, res) => {
    const row = db.prepare('SELECT data FROM folders WHERE id = ?').get(req.params.id) as any;
    if (row) {
      const data = JSON.parse(row.data);
      data.is_deleted = 0;
      delete data.deleted_at;
      db.prepare('UPDATE folders SET data = ? WHERE id = ?').run(JSON.stringify(data), req.params.id);
    }
    res.json({ status: 'success' });
  });
  app.delete('/api/files/:id', (req, res) => {
    const permanent = req.query.permanent === 'true';
    if (permanent) {
      db.prepare('DELETE FROM docs WHERE id = ?').run(req.params.id);
    } else {
      const row = db.prepare('SELECT data FROM docs WHERE id = ?').get(req.params.id) as any;
      if (row) {
        const data = JSON.parse(row.data);
        data.is_deleted = 1;
        db.prepare('UPDATE docs SET data = ? WHERE id = ?').run(JSON.stringify(data), req.params.id);
      }
    }
    res.json({ status: 'success' });
  });
  app.delete('/api/folders/:id', (req, res) => {
    const permanent = req.query.permanent === 'true';
    if (permanent) {
      db.prepare('DELETE FROM folders WHERE id = ?').run(req.params.id);
    } else {
      const row = db.prepare('SELECT data FROM folders WHERE id = ?').get(req.params.id) as any;
      if (row) {
        const data = JSON.parse(row.data);
        data.is_deleted = 1;
        db.prepare('UPDATE folders SET data = ? WHERE id = ?').run(JSON.stringify(data), req.params.id);
      }
    }
    res.json({ status: 'success' });
  });
  app.delete('/api/trash/empty', (req, res) => {
    try {
      const docs = db.prepare('SELECT id, data FROM docs').all() as any[];
      for (const doc of docs) {
        if (doc.data) { try { const d = JSON.parse(doc.data); if (d.is_deleted) db.prepare('DELETE FROM docs WHERE id = ?').run(doc.id); } catch {} }
      }
      const folders = db.prepare('SELECT id, data FROM folders').all() as any[];
      for (const folder of folders) {
        if (folder.data) { try { const f = JSON.parse(folder.data); if (f.is_deleted) db.prepare('DELETE FROM folders WHERE id = ?').run(folder.id); } catch {} }
      }
      const categories = db.prepare('SELECT id, data FROM categories').all() as any[];
      for (const cat of categories) {
        if (cat.data) { try { const c = JSON.parse(cat.data); if (c.is_deleted) db.prepare('DELETE FROM categories WHERE id = ?').run(cat.id); } catch {} }
      }
      res.json({ status: 'success' });
    } catch (e) {
      console.error('❌ TRASH EMPTY ERROR:', e);
      res.json({ status: 'success' });
    }
  });

   app.get('/api/storage', (req, res) => {
    try {
      const rows = db.prepare('SELECT data FROM docs').all() as any[];
      let total = 0;
      for (const row of rows) {
        if (!row?.data) continue;
        const data = JSON.parse(row.data);
        if (data && !data.is_deleted) {
          total += (data.size || 0);
        }
      }
      res.json({ totalStorage: total });
    } catch (err) {
      console.error('❌ GET STORAGE ERROR:', err);
      res.json({ totalStorage: 0 });
    }
  });

  // 30-day Auto Cleanup Logic
  const cleanupTrash = () => {
    console.log("🧹 Running 30-day trash cleanup...");
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const threshold = thirtyDaysAgo.toISOString();

    const tables = ['docs', 'folders'];
    tables.forEach(tableName => {
      try {
        const items = db.prepare(`SELECT id, data FROM ${tableName}`).all() as any[];
        for (const item of items) {
          if (!item?.data) continue;
          const data = JSON.parse(item.data);
          if (data?.is_deleted && data?.deleted_at && data.deleted_at < threshold) {
            console.log(`   - Permanently deleting expired item: ${item.id} from ${tableName}`);
            db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).run(item.id);
          }
        }
      } catch (e) {
        console.warn(`   - Skipping cleanup for ${tableName}: ${e}`);
      }
    });
  };

  // Run cleanup on startup and then every 24 hours
  cleanupTrash();
  setInterval(cleanupTrash, 24 * 60 * 60 * 1000);

  app.get('/api/folders/:id/contents', (req, res) => {
    const folderId = req.params.id;
    try {
      const docs = db.prepare('SELECT data FROM docs').all() as any[];
      const files = docs
        .filter((d: any) => d?.data)
        .map((d: any) => JSON.parse(d.data))
        .filter((d: any) => String(d?.folder_id) === folderId || String(d?.folderId) === folderId)
        .map((d: any) => ({ id: d?.id, name: d?.name, path: d?.name }));
      res.json({ files });
    } catch (e) {
      console.error('Error fetching folder contents:', e);
      res.json({ files: [] });
    }
  });

  // Start FastAPI server (as requested, but we don't proxy Ledger routes to it anymore)
  const _fastapi = spawn('uvicorn', ['main:app', '--port', '8000'], {
    stdio: 'inherit',
    shell: true,
  });
  console.log('🚀 FastAPI server started on port 8000 (for rendering)');

  // Vite middleware for development
    if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
