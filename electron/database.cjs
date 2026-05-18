const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

// Ensure storage folder exists
const { app } = require('electron');

const UPLOADS_DIR = path.join(app.getPath('userData'), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}
const db = new Database(path.join(__dirname, "database.sqlite"));

// ================= INIT =================

// Migration to ensure documents table has TEXT ID (for string IDs)
try {
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='documents'").get();
  if (tableCheck) {
    const columns = db.prepare("PRAGMA table_info(documents)").all();
    const idColumn = columns.find(c => c.name === 'id');
    if (idColumn && idColumn.type.toUpperCase() !== 'TEXT') {
      console.log("Migrating documents table to have TEXT ID...");
      db.exec(`
        CREATE TABLE documents_new (
          id TEXT PRIMARY KEY,
          name TEXT,
          type TEXT,
          size INTEGER DEFAULT 0,
          folder_id TEXT,
          category_id TEXT,
          content BLOB,
          date TEXT,
          synced INTEGER DEFAULT 0,
          is_starred INTEGER DEFAULT 0,
          is_deleted INTEGER DEFAULT 0,
          deleted_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO documents_new (id, name, type, size, folder_id, category_id, content, is_starred, is_deleted, deleted_at, created_at, updated_at)
        SELECT CAST(id AS TEXT), name, type, size, CAST(folder_id AS TEXT), CAST(category_id AS TEXT), content, is_starred, is_deleted, deleted_at, created_at, updated_at FROM documents;
        DROP TABLE documents;
        ALTER TABLE documents_new RENAME TO documents;
      `);
      console.log("Documents table migration completed.");
    }

    // New check for missing columns in existing TEXT table
    const tableColumns = db.prepare("PRAGMA table_info(documents)").all();
    if (!tableColumns.find(c => c.name === 'date')) {
       console.log("Adding 'date' column to documents table...");
       db.exec("ALTER TABLE documents ADD COLUMN date TEXT");
    }
    if (!tableColumns.find(c => c.name === 'synced')) {
       console.log("Adding 'synced' column to documents table...");
       db.exec("ALTER TABLE documents ADD COLUMN synced INTEGER DEFAULT 0");
    }
  }

  const tableCheckKissans = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='kissans'").get();
  if (tableCheckKissans) {
    const kissanCols = db.prepare("PRAGMA table_info(kissans)").all();
    if (!kissanCols.find(c => c.name === 'data')) {
      console.log("Adding 'data' column to kissans table...");
      db.exec("ALTER TABLE kissans ADD COLUMN data TEXT");
    }
  }

  const tableCheckInvestors = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='investors'").get();
  if (tableCheckInvestors) {
    const invCols = db.prepare("PRAGMA table_info(investors)").all();
    if (!invCols.find(c => c.name === 'data')) {
      console.log("Adding 'data' column to investors table...");
      db.exec("ALTER TABLE investors ADD COLUMN data TEXT");
    }
  }

  const tableCheckClients = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='clients'").get();
  if (tableCheckClients) {
    const cliCols = db.prepare("PRAGMA table_info(clients)").all();
    if (!cliCols.find(c => c.name === 'data')) {
      console.log("Adding 'data' column to clients table...");
      db.exec("ALTER TABLE clients ADD COLUMN data TEXT");
    }
  }

  const tableCheckStaff = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='staff'").get();
  if (tableCheckStaff) {
    const staffCols = db.prepare("PRAGMA table_info(staff)").all();
    if (!staffCols.find(c => c.name === 'data')) {
      console.log("Adding 'data' column to staff table...");
      db.exec("ALTER TABLE staff ADD COLUMN data TEXT");
    }
  }
} catch (e) {

  console.error("Migration error for documents table:", e);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT 'Tag',
    is_deleted INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    size INTEGER DEFAULT 0,
    folder_id TEXT,
    category_id TEXT,
    content BLOB,
    date TEXT,
    synced INTEGER DEFAULT 0,
    is_starred INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0,
    deleted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    name TEXT,
    parent_id INTEGER,
    category_id INTEGER,
    icon TEXT DEFAULT 'Folder',
    is_starred INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0,
    deleted_at DATETIME,
    is_locked INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT
  );

  CREATE TABLE IF NOT EXISTS master_properties (
    id TEXT PRIMARY KEY,
    name TEXT,
    location TEXT
  );

  CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,

  title TEXT,
  name TEXT,
  fatherName TEXT,
  occupation TEXT,
  dob TEXT,
  age INTEGER,
  gender TEXT,

  phone TEXT,
  email TEXT,

  address TEXT,
  district TEXT,
  state TEXT,
  pincode TEXT,

  projectLocality TEXT,
  projectDistrict TEXT,
  projectState TEXT,

  aadhaar TEXT,
  pan TEXT,
  gstin TEXT,

  username TEXT,
  password TEXT,

  bankName TEXT,
  accountNumber TEXT,
  ifscCode TEXT,

  categoryId INTEGER,
  folderId INTEGER,

  balance REAL,
  propertyCount INTEGER,
  openingBalance REAL,
  totalContractValue REAL,
  totalAmount REAL DEFAULT 0,
  investments TEXT,
  payments TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

  CREATE TABLE IF NOT EXISTS kissans (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    fatherName TEXT,
    village TEXT,
    balance REAL,
    openingBalance REAL,
    data TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS investors (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    totalInvested REAL,
    totalReturns REAL,
    totalInterestAccrued REAL,
    currentBalance REAL,
    openingBalance REAL,
    status TEXT DEFAULT 'Active',
    joinDate TEXT,
    data TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS loans (
    id TEXT PRIMARY KEY,
    borrowerName TEXT,
    principalAmount REAL,
    interestRate REAL,
    startDate TEXT,
    totalPaid REAL,
    remainingPrincipal REAL,
    status TEXT,
    lastPaymentDate TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    title TEXT,
    location TEXT,
    price REAL,
    status TEXT,
    inventory TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    date TEXT,
    particulars TEXT,
    amount REAL,
    type TEXT,
    category TEXT,
    method TEXT,
    referenceId TEXT,
    clientId TEXT,
    propertyId TEXT,
    kissanId TEXT,
    ownerId TEXT,
    investorId TEXT,
    loanId TEXT,
    balanceAfter REAL,
    synced INTEGER DEFAULT 0,
    dueDate TEXT,
    expenseCategory TEXT,
    bankId TEXT,
    toBankId TEXT,
    linkedTransactionId TEXT,
    partyName TEXT,
    agriType TEXT,
    purpose TEXT,
    displayLabel TEXT,
    partNumber TEXT,
    manualPart TEXT,
    expensePayee TEXT,
    staffId TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    commissionRate REAL,
    totalEarned REAL,
    totalPaid REAL,
    balance REAL
  );

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

  CREATE TABLE IF NOT EXISTS global_id_counter (
    id TEXT PRIMARY KEY,
    current_serial INTEGER DEFAULT 784
  );

  INSERT OR IGNORE INTO global_id_counter (id, current_serial) VALUES ('main', 784);

  -- ================= BANK =================
CREATE TABLE IF NOT EXISTS banks (
  id TEXT PRIMARY KEY,
  name TEXT,
  accountNumber TEXT,
  ifsc TEXT,
  branch TEXT,
  balance REAL DEFAULT 0
);

-- ================= STAFF =================
CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  role TEXT,
  salary REAL,
  balance REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pending_receipts (
  id TEXT PRIMARY KEY,
  data TEXT
);

CREATE TABLE IF NOT EXISTS gst_entries (
  id TEXT PRIMARY KEY,
  date TEXT,
  partyName TEXT,
  gstNumber TEXT,
  type TEXT,
  amount REAL,
  gstAmount REAL,
  totalAmount REAL,
  description TEXT,
  data TEXT
);

CREATE TABLE IF NOT EXISTS property_market_updates (
  id TEXT PRIMARY KEY,
  propertyId TEXT,
  date TEXT,
  updateType TEXT,
  description TEXT,
  valueModifier REAL,
  synced INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sync_log (
  id TEXT PRIMARY KEY,
  operation TEXT,
  tableName TEXT,
  rowId TEXT,
  data TEXT,
  machineId TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS machine_registration (
  machineId TEXT PRIMARY KEY,
  name TEXT,
  deviceType TEXT,
  lastSync TEXT,
  status TEXT DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS installation_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  mode TEXT,
  ledgerId TEXT,
  machineId TEXT,
  syncCode TEXT,
  serverUrl TEXT,
  isInitialized INTEGER DEFAULT 0
);
`);

// ================= MIGRATION =================
function ensureColumn(table, column, type) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = cols.some(c => c.name === column);

  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    console.log(`Added column ${column} to ${table}`);
  }
}

function migrate() {
  try {
    const tableInfo = (table) =>
      db.prepare(`PRAGMA table_info(${table})`).all();

  ensureColumn("transactions", "ownerId", "TEXT");
  ensureColumn("transactions", "dueDate", "TEXT");
  ensureColumn("transactions", "expenseCategory", "TEXT");
  ensureColumn("transactions", "bankId", "TEXT");
  ensureColumn("transactions", "toBankId", "TEXT");
  ensureColumn("transactions", "linkedTransactionId", "TEXT");
  ensureColumn("transactions", "partyName", "TEXT");
  ensureColumn("transactions", "agriType", "TEXT");
  ensureColumn("transactions", "purpose", "TEXT");
  ensureColumn("transactions", "displayLabel", "TEXT");
  ensureColumn("transactions", "partNumber", "TEXT");
  ensureColumn("transactions", "manualPart", "TEXT");
  ensureColumn("transactions", "expensePayee", "TEXT");
  ensureColumn("transactions", "staffId", "TEXT");

  const clientCols = tableInfo("clients").map(c => c.name);

if (!clientCols.includes("fatherName"))
  db.exec("ALTER TABLE clients ADD COLUMN fatherName TEXT");

if (!clientCols.includes("occupation"))
  db.exec("ALTER TABLE clients ADD COLUMN occupation TEXT");

if (!clientCols.includes("dob"))
  db.exec("ALTER TABLE clients ADD COLUMN dob TEXT");

if (!clientCols.includes("age"))
  db.exec("ALTER TABLE clients ADD COLUMN age INTEGER");

if (!clientCols.includes("gender"))
  db.exec("ALTER TABLE clients ADD COLUMN gender TEXT");

if (!clientCols.includes("district"))
  db.exec("ALTER TABLE clients ADD COLUMN district TEXT");

if (!clientCols.includes("state"))
  db.exec("ALTER TABLE clients ADD COLUMN state TEXT");

if (!clientCols.includes("pincode"))
  db.exec("ALTER TABLE clients ADD COLUMN pincode TEXT");

if (!clientCols.includes("projectLocality"))
  db.exec("ALTER TABLE clients ADD COLUMN projectLocality TEXT");

if (!clientCols.includes("projectDistrict"))
  db.exec("ALTER TABLE clients ADD COLUMN projectDistrict TEXT");

if (!clientCols.includes("projectState"))
  db.exec("ALTER TABLE clients ADD COLUMN projectState TEXT");

if (!clientCols.includes("aadhaar"))
  db.exec("ALTER TABLE clients ADD COLUMN aadhaar TEXT");

if (!clientCols.includes("pan"))
  db.exec("ALTER TABLE clients ADD COLUMN pan TEXT");

if (!clientCols.includes("gstin"))
  db.exec("ALTER TABLE clients ADD COLUMN gstin TEXT");

if (!clientCols.includes("username"))
  db.exec("ALTER TABLE clients ADD COLUMN username TEXT");

if (!clientCols.includes("password"))
  db.exec("ALTER TABLE clients ADD COLUMN password TEXT");

if (!clientCols.includes("bankName"))
  db.exec("ALTER TABLE clients ADD COLUMN bankName TEXT");

if (!clientCols.includes("accountNumber"))
  db.exec("ALTER TABLE clients ADD COLUMN accountNumber TEXT");

if (!clientCols.includes("ifscCode"))
  db.exec("ALTER TABLE clients ADD COLUMN ifscCode TEXT");

if (!clientCols.includes("categoryId"))
  db.exec("ALTER TABLE clients ADD COLUMN categoryId INTEGER");

if (!clientCols.includes("folderId"))
  db.exec("ALTER TABLE clients ADD COLUMN folderId INTEGER");

if (!clientCols.includes("balance"))
  db.exec("ALTER TABLE clients ADD COLUMN balance REAL DEFAULT 0");

if (!clientCols.includes("propertyCount"))
  db.exec("ALTER TABLE clients ADD COLUMN propertyCount INTEGER DEFAULT 0");

if (!clientCols.includes("openingBalance"))
  db.exec("ALTER TABLE clients ADD COLUMN openingBalance REAL DEFAULT 0");

if (!clientCols.includes("totalContractValue"))
  db.exec("ALTER TABLE clients ADD COLUMN totalContractValue REAL DEFAULT 0");

if (!clientCols.includes("totalAmount"))
  db.exec("ALTER TABLE clients ADD COLUMN totalAmount REAL DEFAULT 0");

if (!clientCols.includes("investments"))
  db.exec("ALTER TABLE clients ADD COLUMN investments TEXT");

if (!clientCols.includes("payments"))
  db.exec("ALTER TABLE clients ADD COLUMN payments TEXT");

  const documentsCols = tableInfo("documents").map((c) => c.name);
  if (!documentsCols.includes("size"))
    db.exec("ALTER TABLE documents ADD COLUMN size INTEGER DEFAULT 0");
  if (!documentsCols.includes("is_deleted"))
    db.exec("ALTER TABLE documents ADD COLUMN is_deleted INTEGER DEFAULT 0");
  if (!documentsCols.includes("deleted_at"))
    db.exec("ALTER TABLE documents ADD COLUMN deleted_at DATETIME");
  if (!documentsCols.includes("is_starred"))
    db.exec("ALTER TABLE documents ADD COLUMN is_starred INTEGER DEFAULT 0");
  if (!documentsCols.includes("category_id"))
    db.exec(
      "ALTER TABLE documents ADD COLUMN category_id INTEGER REFERENCES categories(id)"
    );
  const categoriesCols = tableInfo("categories").map(c => c.name);
  if (!categoriesCols.includes("is_deleted"))
  db.exec("ALTER TABLE categories ADD COLUMN is_deleted INTEGER DEFAULT 0");
  if (!categoriesCols.includes("deleted_at"))
  db.exec("ALTER TABLE categories ADD COLUMN deleted_at DATETIME");
  const foldersCols = tableInfo("folders").map((c) => c.name);
  if (!foldersCols.includes("category_id"))
    db.exec(
      "ALTER TABLE folders ADD COLUMN category_id INTEGER REFERENCES categories(id)"
    );
  if (!foldersCols.includes("is_deleted"))
    db.exec("ALTER TABLE folders ADD COLUMN is_deleted INTEGER DEFAULT 0");
  if (!foldersCols.includes("deleted_at"))
    db.exec("ALTER TABLE folders ADD COLUMN deleted_at DATETIME");
  if (!foldersCols.includes("is_starred"))
    db.exec("ALTER TABLE folders ADD COLUMN is_starred INTEGER DEFAULT 0");
  if (!foldersCols.includes("is_locked"))
    db.exec("ALTER TABLE folders ADD COLUMN is_locked INTEGER DEFAULT 0");
  if (!foldersCols.includes("data"))
    db.exec("ALTER TABLE folders ADD COLUMN data TEXT");
  if (!foldersCols.includes("icon"))
    db.exec("ALTER TABLE folders ADD COLUMN icon TEXT DEFAULT 'Folder'");

  try {
    const docsCols = tableInfo("docs").map((c) => c.name);

    if (!docsCols.includes("created_at")) db.exec("ALTER TABLE docs ADD COLUMN created_at DATETIME");
    if (!docsCols.includes("updated_at")) db.exec("ALTER TABLE docs ADD COLUMN updated_at DATETIME");

    if (!docsCols.includes("propertyId")) db.exec("ALTER TABLE docs ADD COLUMN propertyId TEXT");
    if (!docsCols.includes("clientId")) db.exec("ALTER TABLE docs ADD COLUMN clientId TEXT");
    if (!docsCols.includes("kissanId")) db.exec("ALTER TABLE docs ADD COLUMN kissanId TEXT");
    if (!docsCols.includes("ownerId")) db.exec("ALTER TABLE docs ADD COLUMN ownerId TEXT");
    if (!docsCols.includes("investorId")) db.exec("ALTER TABLE docs ADD COLUMN investorId TEXT");
    if (!docsCols.includes("loanId")) db.exec("ALTER TABLE docs ADD COLUMN loanId TEXT");
    if (!docsCols.includes("fileData")) db.exec("ALTER TABLE docs ADD COLUMN fileData TEXT");
    if (!docsCols.includes("folder_id")) db.exec("ALTER TABLE docs ADD COLUMN folder_id TEXT");
    if (!docsCols.includes("category_id")) db.exec("ALTER TABLE docs ADD COLUMN category_id TEXT");
    if (!docsCols.includes("data")) db.exec("ALTER TABLE docs ADD COLUMN data TEXT");
  } catch (e) {
    // Table might not exist yet
  }

  try {
    db.prepare("DELETE FROM folders WHERE id IS NULL").run();
  } catch (e) {}

  const count = db
    .prepare(
      "SELECT COUNT(*) as count FROM folders WHERE name >= '0701' AND name <= '0850'"
    )
    .get();

  console.log("Migration: Folder count =", count.count);

  if (count.count < 150) {
    console.log("Migration: inserting 150 folders...");

    const stmt = db.prepare(
      `INSERT OR IGNORE INTO folders (id, name, parent_id, is_locked, is_deleted) VALUES (?, ?, NULL, 1, 0)`
    );

    const insertMany = db.transaction((names) => {
      for (const name of names) stmt.run(name, name);
    });

    const names = [];
    for (let i = 701; i <= 850; i++) {
      names.push(i.toString().padStart(4, "0"));
    }

    insertMany(names);
    console.log("Migration: folders inserted.");
  }
} catch (migError) {
  console.error("Migration fatal error (database might be corrupt):", migError);
}
}

migrate();

db.exec(`
  UPDATE folders 
  SET is_deleted = 0 
  WHERE is_deleted IS NULL
`);

function getCategories() {
  return db.prepare(`
    SELECT * FROM categories 
    WHERE is_deleted = 0
    ORDER BY name ASC
  `).all();
}

function addCategory(name, color, icon) {
  try {
    const stmt = db.prepare(
      "INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)"
    );
    const result = stmt.run(name, color || "#3B82F6", icon || "Tag");

    return {
      id: result.lastInsertRowid,
      name,
      color,
      icon: icon || "Tag",
    };
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return db
        .prepare("SELECT * FROM categories WHERE name = ?")
        .get(name);
    }
    throw err;
  }
}

function updateCategory(id, updates) {
  const keys = Object.keys(updates);
  if (!keys.length) return;

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const params = [...Object.values(updates), id];

  db.prepare(`UPDATE categories SET ${setClause} WHERE id = ?`).run(
    ...params
  );
}

function deleteCategory(id) {
  // 1. Remove category from folders
  db.prepare(`
    UPDATE folders 
    SET category_id = NULL 
    WHERE category_id = ?
  `).run(id);

  // 2. Soft delete category (move to trash)
  db.prepare(`
    UPDATE categories 
    SET 
      is_deleted = 1,
      deleted_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(id);
}

function restoreCategory(id) {
  db.prepare(`
    UPDATE categories 
    SET 
      is_deleted = 0,
      deleted_at = NULL
    WHERE id = ?
  `).run(id);
}

function permanentlyDeleteCategory(id) {
  db.prepare(`
    DELETE FROM categories 
    WHERE id = ?
  `).run(id);
}

// ================= FOLDERS =================

function getFolders(showDeleted = false) {
  let sql = "SELECT * FROM folders";
  let params = [];
  
  if (!showDeleted) {
    sql += " WHERE is_deleted = 0";
  }
  
  sql += " ORDER BY name ASC";
  return db.prepare(sql).all(...params).map(f => ({
    ...f,
    is_deleted: f.is_deleted === 1,
    is_starred: f.is_starred === 1
  }));
}


function saveFolder(folder) {
  const stmt = db.prepare(`
    INSERT INTO folders (
      id, name, parent_id, category_id, icon, is_starred, is_deleted, is_locked
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      parent_id=excluded.parent_id,
      category_id=excluded.category_id,
      icon=excluded.icon,
      is_starred=excluded.is_starred,
      is_deleted=excluded.is_deleted,
      is_locked=excluded.is_locked,
      updated_at=CURRENT_TIMESTAMP
  `);

  stmt.run(
    folder.id.toString(),
    folder.name,
    folder.parent_id || null,
    folder.category_id || null,
    folder.icon || 'Folder',
    folder.is_starred ? 1 : 0,
    typeof folder.is_deleted === 'number' ? folder.is_deleted : 0,
    folder.is_locked ? 1 : 0
  );

  return folder;
}

function updateFolder(id, updates) {
  const keys = Object.keys(updates);
  if (!keys.length) return;

  const sanitizedUpdates = {};
  keys.forEach(key => {
    if (typeof updates[key] === 'boolean') {
      sanitizedUpdates[key] = updates[key] ? 1 : 0;
    } else {
      sanitizedUpdates[key] = updates[key];
    }
  });

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const params = keys.map(k => sanitizedUpdates[k]);
  params.push(id.toString());

  db.prepare(
    `UPDATE folders SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).run(...params);
}

function deleteFolder(id, permanent) {
  const folder = db.prepare("SELECT * FROM folders WHERE id = ?").get(id);

  if (folder?.is_locked) return; // 🚫 block system folders

  if (permanent) {
    db.prepare("DELETE FROM folders WHERE id = ?").run(id.toString());
  } else {
    console.log("DELETE FOLDER:", id);db.prepare(
      "UPDATE folders SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(id.toString());
  }
}

function getDeletedCategories() {
  return db.prepare(`
    SELECT * FROM categories 
    WHERE is_deleted = 1
    ORDER BY created_at DESC
  `).all();
}

// ================= DOCUMENTS =================

function getDocuments(query = {}) {
  console.log("DB: getDocuments called with query:", query);
  let filesQuery = "SELECT * FROM documents";
  let params = [];
  let conditions = [];

  if (!query.includeDeleted) {
    conditions.push("is_deleted = 0");
  }

  if (query.starred) {
    conditions.push("is_starred = 1");
  }

  if (query.category_id) {
    conditions.push("category_id = ?");
    params.push(query.category_id);
  } else if (query.parent_id !== undefined || query.folder_id !== undefined) {
  const folderId = query.parent_id ?? query.folder_id;
  conditions.push("folder_id = ?");
  params.push(folderId || null);
}

  if (conditions.length > 0) {
    filesQuery += " WHERE " + conditions.join(" AND ");
  }

  if (query.recent) {
    filesQuery += " ORDER BY created_at DESC LIMIT 20";
  }

  const results = db
    .prepare(filesQuery)
    .all(...params)
    .map((f) => ({ 
      ...f, 
      fileData: f.content ? f.content.toString('base64') : null,
      synced: f.synced === 1,
      is_deleted: f.is_deleted === 1,
      is_starred: f.is_starred === 1
    }));
  return results;
}

function saveDocument(doc) {
  console.log("DB: saveDocument called for:", doc.name, "ID:", doc.id, "Folder:", doc.folder_id || doc.folderId);
  const stmt = db.prepare(`
    INSERT INTO documents (
      id, name, type, size, folder_id, category_id, content, date, synced, is_starred, is_deleted
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      type=excluded.type,
      size=excluded.size,
      folder_id=excluded.folder_id,
      category_id=excluded.category_id,
      content=excluded.content,
      date=excluded.date,
      synced=excluded.synced,
      is_starred=excluded.is_starred,
      is_deleted=excluded.is_deleted,
      updated_at=CURRENT_TIMESTAMP
  `);

  stmt.run(
    doc.id.toString(),
    doc.name,
    doc.type,
    Number(doc.size) || 0,
    doc.folder_id ? doc.folder_id.toString() : (doc.folderId ? doc.folderId.toString() : null),
    doc.category_id ? doc.category_id.toString() : null,
    doc.fileData || null,
    doc.date || new Date().toISOString(),
    doc.synced ? 1 : 0,
    doc.is_starred ? 1 : 0,
    doc.is_deleted ? 1 : 0
  );
}

function updateDocument(id, updates) {
  const keys = Object.keys(updates);
  if (!keys.length) return;

  const sanitizedUpdates = {};
  keys.forEach(key => {
    if (typeof updates[key] === 'boolean') {
      sanitizedUpdates[key] = updates[key] ? 1 : 0;
    } else {
      sanitizedUpdates[key] = updates[key];
    }
  });

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const params = keys.map(k => sanitizedUpdates[k]);
  params.push(id.toString());

  db.prepare(
    `UPDATE documents SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).run(...params);
}

function deleteDocument(id, permanent) {
  if (permanent) {
    db.prepare("DELETE FROM documents WHERE id = ?").run(id.toString());
  } else {
    db.prepare(
      "UPDATE documents SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(id.toString());
  }
}

function emptyTrash() {
  db.prepare("DELETE FROM documents WHERE is_deleted = 1").run();
  db.prepare("DELETE FROM folders WHERE is_deleted = 1").run();
  db.prepare("DELETE FROM categories WHERE is_deleted = 1").run();
}

function cleanupTrash() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString();

  // Run cleanup for documents, folders, and categories
  db.prepare("DELETE FROM documents WHERE is_deleted = 1 AND (deleted_at < ? OR (deleted_at IS NULL AND created_at < ?))").run(cutoff, cutoff);
  db.prepare("DELETE FROM folders WHERE is_deleted = 1 AND (deleted_at < ? OR (deleted_at IS NULL AND created_at < ?))").run(cutoff, cutoff);
  db.prepare("DELETE FROM categories WHERE is_deleted = 1 AND created_at < ?").run(cutoff);
}

// ================= LEDGER CRUD =================

function getSettings() {
  const row = db.prepare("SELECT data FROM settings WHERE id = 1").get();
  return row ? JSON.parse(row.data) : {};
}

function saveSettings(settings) {
  db.prepare("INSERT OR REPLACE INTO settings (id, data) VALUES (1, ?)").run(JSON.stringify(settings));
}

function getMasterProperties() {
  return db.prepare("SELECT * FROM master_properties").all();
}

function getMasterPropertyById(id) {
  return db.prepare("SELECT * FROM master_properties WHERE id = ?").get(id);
}

function saveMasterProperty(property) {
  db.prepare("INSERT OR REPLACE INTO master_properties (id, name, location) VALUES (?, ?, ?)").run(property.id, property.name, property.location);
}

function getClients() {
  return db.prepare("SELECT * FROM clients").all().map(c => {
    let fullData = {};
    if (c.data) {
      try {
        fullData = JSON.parse(c.data);
      } catch (e) {}
    }
    return {
      ...c,
      ...fullData,
      categoryId: c.categoryId ?? null,
      folderId: c.folderId ?? null,
      investments: c.investments ? JSON.parse(c.investments) : [],
      payments: c.payments ? JSON.parse(c.payments) : [],
      data: undefined
    };
  });
}

function getClientById(id) {
  const c = db.prepare("SELECT * FROM clients WHERE id = ?").get(id);
  if (!c) return undefined;

  let fullData = {};
  if (c.data) {
    try {
      fullData = JSON.parse(c.data);
    } catch (e) {}
  }

  return {
    ...c,
    ...fullData,
    categoryId: c.categoryId ?? null,
    folderId: c.folderId ?? null,
    investments: c.investments ? JSON.parse(c.investments) : [],
    payments: c.payments ? JSON.parse(c.payments) : [],
    data: undefined
  };
}

function saveClient(client) {
  const data = JSON.stringify(client);
  db.prepare(`
    INSERT OR REPLACE INTO clients (
      id,
      title, name, fatherName, occupation, dob, age, gender,
      phone, email,
      address, district, state, pincode,
      projectLocality, projectDistrict, projectState,
      aadhaar, pan, gstin,
      username, password,
      bankName, accountNumber, ifscCode,
      categoryId, folderId,
      balance, propertyCount, openingBalance, totalContractValue,
      totalAmount,
      investments, payments, data
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    client.id,

    client.title,
    client.name,
    client.fatherName,
    client.occupation,
    client.dob,
    client.age,
    client.gender,

    client.phone,
    client.email,

    client.address,
    client.district,
    client.state,
    client.pincode,

    client.projectLocality,
    client.projectDistrict,
    client.projectState,

    client.aadhaar,
    client.pan,
    client.gstin,

    client.username,
    client.password,

    client.bankName,
    client.accountNumber,
    client.ifscCode,

    client.categoryId,
    client.folderId,

    client.balance || 0,
    client.propertyCount || 0,
    client.openingBalance || 0,
    client.totalContractValue || 0,
    client.totalAmount || 0,

    JSON.stringify(client.investments || []),
    JSON.stringify(client.payments || []),
    data
  );
  logSyncOperation('SAVE', 'clients', client.id, client);
}

function deleteClient(id) {
  db.prepare("DELETE FROM clients WHERE id = ?").run(id);
}

function getTodayClientCount(dateStr) {
  return db.prepare(`
    SELECT COUNT(*) as count 
    FROM clients 
    WHERE id LIKE ?
  `).get(`CID/AG/${dateStr}/%`).count;
}

function normalizeKissanRow(k) {
  let fullData = { owners: [], documents: [] };
  if (k.data) {
    try {
      fullData = { ...fullData, ...JSON.parse(k.data) };
    } catch (e) {}
  }

  const merged = { ...k, ...fullData, data: undefined };
  return {
    ...merged,
    landName: merged.landName || merged.name || '',
    owners: Array.isArray(merged.owners) ? merged.owners : [],
    documents: Array.isArray(merged.documents) ? merged.documents : [],
    totalLandValue: Number(merged.totalLandValue) || 0,
    openingBalance: Number(merged.openingBalance) || 0,
    balance: Number(merged.balance) || 0,
  };
}

function getKissans() {
  return db.prepare("SELECT * FROM kissans").all().map(normalizeKissanRow);
}

function getKissanById(id) {
  const k = db.prepare("SELECT * FROM kissans WHERE id = ?").get(id);
  if (!k) return undefined;
  return normalizeKissanRow(k);
}

function saveKissan(kissan) {
  const normalized = {
    ...kissan,
    landName: kissan.landName || kissan.name || '',
    owners: Array.isArray(kissan.owners) ? kissan.owners : [],
    totalLandValue: Number(kissan.totalLandValue) || 0,
    openingBalance: Number(kissan.openingBalance) || 0,
    balance: Number(kissan.balance) || 0,
  };
  const data = JSON.stringify(normalized);

  db.prepare(`
    INSERT INTO kissans
    (id, name, phone, fatherName, village, balance, openingBalance, data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      phone=excluded.phone,
      fatherName=excluded.fatherName,
      village=excluded.village,
      balance=excluded.balance,
      openingBalance=excluded.openingBalance,
      data=excluded.data
  `).run(
    normalized.id,
    normalized.landName,
    normalized.phone || '',
    normalized.fatherName || '',
    normalized.village || '',
    normalized.balance,
    normalized.openingBalance,
    data
  );
}

function deleteKissan(id) {
  db.prepare("DELETE FROM kissans WHERE id = ?").run(id);
}

function getInvestors() {
  return db.prepare("SELECT * FROM investors").all().map(i => {
    let fullData = {};
    if (i.data) {
      try {
        fullData = JSON.parse(i.data);
      } catch (e) {}
    }
    return { ...i, ...fullData, data: undefined };
  });
}

function getInvestorById(id) {
  const i = db.prepare("SELECT * FROM investors WHERE id = ?").get(id);
  if (!i) return undefined;
  let fullData = {};
  if (i.data) {
    try {
      fullData = JSON.parse(i.data);
    } catch (e) {}
  }
  return { ...i, ...fullData, data: undefined };
}

function saveInvestor(investor) {
  const data = JSON.stringify(investor);
  db.prepare(`
    INSERT OR REPLACE INTO investors 
    (id, name, phone, totalInvested, totalReturns, totalInterestAccrued, currentBalance, status, joinDate, data) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    investor.id, 
    investor.name, 
    investor.phone, 
    investor.totalInvested || 0, 
    investor.totalReturns || 0, 
    investor.totalInterestAccrued || 0, 
    investor.currentBalance || 0,
    investor.status || 'Active',
    investor.joinDate || new Date().toISOString().split('T')[0],
    data
  );
}

// ================= MARKET UPDATES =================

function getPropertyMarketUpdates(propertyId) {
  if (propertyId) {
    return db.prepare("SELECT * FROM property_market_updates WHERE propertyId = ? ORDER BY date DESC").all(propertyId);
  }
  return db.prepare("SELECT * FROM property_market_updates ORDER BY date DESC").all();
}

function savePropertyMarketUpdate(update) {
  db.prepare(`
    INSERT OR REPLACE INTO property_market_updates 
    (id, propertyId, date, updateType, description, valueModifier, synced) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    update.id,
    update.propertyId,
    update.date || new Date().toISOString(),
    update.updateType,
    update.description,
    update.valueModifier,
    update.synced ? 1 : 0
  );
}

function deletePropertyMarketUpdate(id) {
  db.prepare("DELETE FROM property_market_updates WHERE id = ?").run(id);
}

function getLoans() {
  return db.prepare("SELECT * FROM loans").all();
}

function getLoanById(id) {
  return db.prepare("SELECT * FROM loans WHERE id = ?").get(id);
}

function saveLoan(loan) {
  db.prepare(`
    INSERT OR REPLACE INTO loans 
    (id, borrowerName, principalAmount, interestRate, startDate, totalPaid, remainingPrincipal, status, lastPaymentDate) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(loan.id, loan.borrowerName, loan.principalAmount, loan.interestRate, loan.startDate, loan.totalPaid, loan.remainingPrincipal, loan.status, loan.lastPaymentDate);
}

function deleteLoan(id) {
  db.prepare("DELETE FROM loans WHERE id = ?").run(id);
}

function getProperties() {
  return db.prepare("SELECT * FROM properties").all().map(p => {
    let full = {};

    try {
      full = p.data ? JSON.parse(p.data) : {};
    } catch (e) {}

    return {
      ...p,
      ...full, // 🔥 restore full structure
      inventory: p.inventory ? JSON.parse(p.inventory) : []
    };
  });
}

function getPropertyById(id) {
  const p = db.prepare("SELECT * FROM properties WHERE id = ?").get(id);
  if (!p) return undefined;

  let full = {};
  try {
    full = p.data ? JSON.parse(p.data) : {};
  } catch (e) {}

  return {
    ...p,
    ...full,
    inventory: p.inventory ? JSON.parse(p.inventory) : []
  };
}

function saveProperty(property) {
  db.prepare(`
    INSERT INTO properties 
    (id, title, location, price, status, inventory, data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title=excluded.title,
      location=excluded.location,
      price=excluded.price,
      status=excluded.status,
      inventory=excluded.inventory,
      data=excluded.data
  `).run(
    property.id,
    property.title,
    property.locality || property.location || '',
    property.price,
    property.status,
    JSON.stringify(property.inventory || []),
    JSON.stringify(property) // 🔥 FULL OBJECT
  );
  logSyncOperation('SAVE', 'properties', property.id, property);
}

function deleteProperty(id) {
  db.prepare("DELETE FROM properties WHERE id = ?").run(id);
}

function updateProperty(id, updates) {
  const existing = getPropertyById(id);
  if (!existing) return;

  const updated = {
    ...existing,
    ...updates,

    // 🔥 PRESERVE NESTED DATA
    inventory: updates.inventory ?? existing.inventory,
    amenities: updates.amenities ?? existing.amenities,
    nearbyPlaces: updates.nearbyPlaces ?? existing.nearbyPlaces,
    images: updates.images ?? existing.images,
    coordinates: updates.coordinates ?? existing.coordinates,
  };

  saveProperty(updated);
}

function assignPlotToClient(propertyId, plotId, clientId, clientData) {
  const p = getPropertyById(propertyId);
  if (!p) return;
  
  const plotIndex = p.inventory.findIndex(plot => plot.id === plotId);
  if (plotIndex === -1) return;
  
  p.inventory[plotIndex] = {
    ...p.inventory[plotIndex],
    status: clientData.status,
    clientId: clientId,
    clientName: clientData.name,
    clientPhone: clientData.phone,
    amount: clientData.amount || p.inventory[plotIndex].price
  };
  
  saveProperty(p);
}

function getTransactions() {
  return db.prepare("SELECT * FROM transactions").all();
}

function saveTransaction(tx) {
  db.prepare(`
    INSERT OR REPLACE INTO transactions 
    (id, date, particulars, amount, type, category, method, referenceId, clientId, propertyId, kissanId, ownerId, investorId, loanId, balanceAfter, synced, dueDate, expenseCategory, bankId, toBankId, linkedTransactionId, partyName, agriType, purpose, displayLabel, partNumber, manualPart, expensePayee, staffId) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    tx.id, tx.date, tx.particulars, tx.amount, tx.type, tx.category, tx.method, tx.referenceId, tx.clientId, tx.propertyId, tx.kissanId, tx.ownerId, tx.investorId, tx.loanId, tx.balanceAfter, tx.synced ? 1 : 0,
    tx.dueDate, tx.expenseCategory, tx.bankId, tx.toBankId, tx.linkedTransactionId, tx.partyName, tx.agriType, tx.purpose, tx.displayLabel, tx.partNumber, tx.manualPart, tx.expensePayee, tx.staffId
  );
  logSyncOperation('SAVE', 'transactions', tx.id, tx);
}

function deleteTransaction(id) {
  db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
}

function getReferrals() {
  return db.prepare("SELECT * FROM referrals").all().map(r => {
    let fullData = {};
    if (r.data) {
      try { fullData = JSON.parse(r.data); } catch (e) {}
    }
    return { ...r, ...fullData, data: undefined };
  });
}

function saveReferral(referral) {
  const data = JSON.stringify(referral);
  db.prepare(`
    INSERT OR REPLACE INTO referrals 
    (id, name, phone, commissionRate, totalEarned, totalPaid, balance, data) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(referral.id, referral.refereeName, referral.refereePhone, referral.commissionRate, referral.totalEarned, referral.totalPaid, referral.balance, data);
}

function deleteReferral(id) {
  db.prepare("DELETE FROM referrals WHERE id = ?").run(id);
}

// ================= BANK =================

function getBanks() {
  const rows = db.prepare("SELECT * FROM banks").all();
  return rows.map(row => {
    if (row.data) {
      try {
        const fullData = JSON.parse(row.data);
        return { ...fullData, ...row, data: undefined };
      } catch (e) { return row; }
    }
    return row;
  });
}

function getBankById(id) {
  const row = db.prepare("SELECT * FROM banks WHERE id = ?").get(id);
  if (row && row.data) {
    try {
      const fullData = JSON.parse(row.data);
      return { ...fullData, ...row, data: undefined };
    } catch (e) { return row; }
  }
  return row;
}

function saveBank(bank) {
  const data = JSON.stringify(bank);
  db.prepare(`
    INSERT OR REPLACE INTO banks 
    (id, name, accountNumber, ifsc, branch, balance, data) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    bank.id,
    bank.bankName || bank.name,
    bank.accountNumber,
    bank.ifsc,
    bank.branch,
    bank.balance || bank.openingBalance || 0,
    data
  );
}

function deleteBank(id) {
  db.prepare("DELETE FROM banks WHERE id = ?").run(id);
}

// ================= STAFF =================

function getStaff() {
  const rows = db.prepare("SELECT * FROM staff").all();
  return rows.map(row => {
    if (row.data) {
      try {
        const fullData = JSON.parse(row.data);
        return { ...fullData, ...row, data: undefined };
      } catch (e) { return row; }
    }
    return row;
  });
}

function getStaffById(id) {
  const row = db.prepare("SELECT * FROM staff WHERE id = ?").get(id);
  if (row && row.data) {
    try {
      const fullData = JSON.parse(row.data);
      return { ...fullData, ...row, data: undefined };
    } catch (e) { return row; }
  }
  return row;
}

function saveStaff(staff) {
  const data = JSON.stringify(staff);
  db.prepare(`
    INSERT OR REPLACE INTO staff 
    (id, name, phone, role, salary, balance, data) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    staff.id,
    staff.name,
    staff.phone,
    staff.role,
    staff.salary,
    staff.balance || 0,
    data
  );
}

function deleteStaff(id) {
  db.prepare("DELETE FROM staff WHERE id = ?").run(id);
}

// ================= PENDING RECEIPTS =================

function getPendingReceipts() {
  return db.prepare("SELECT data FROM pending_receipts").all().map(r => JSON.parse(r.data));
}

function savePendingReceipt(receipt) {
  db.prepare("INSERT OR REPLACE INTO pending_receipts (id, data) VALUES (?, ?)").run(receipt.id, JSON.stringify(receipt));
}

function deletePendingReceipt(id) {
  db.prepare("DELETE FROM pending_receipts WHERE id = ?").run(id);
}

// ================= GST ENTRIES =================

function getGstEntries() {
  const rows = db.prepare("SELECT * FROM gst_entries ORDER BY date DESC").all();
  return rows.map(row => {
    if (row.data) {
      try {
        const fullData = JSON.parse(row.data);
        return { ...fullData, ...row, data: undefined };
      } catch (e) { return row; }
    }
    return row;
  });
}

function saveGstEntry(entry) {
  const data = JSON.stringify(entry);
  db.prepare(`
    INSERT OR REPLACE INTO gst_entries 
    (id, date, partyName, gstNumber, type, amount, gstAmount, totalAmount, description, data) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    entry.id,
    entry.date,
    entry.partyName,
    entry.gstNumber,
    entry.type,
    entry.amount,
    entry.gstAmount,
    entry.totalAmount,
    entry.description,
    data
  );
}

function deleteGstEntry(id) {
  db.prepare("DELETE FROM gst_entries WHERE id = ?").run(id);
}

function updateGstEntry(id, updates) {
  const keys = Object.keys(updates);
  if (!keys.length) return;

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const params = [...Object.values(updates), id.toString()];

  db.prepare(
    `UPDATE gst_entries SET ${setClause} WHERE id = ?`
  ).run(...params);
}

function generateId(prefix, date) {
  const targetDate = date ? new Date(date) : new Date();
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const getAndIncrement = db.transaction(() => {
    const row = db.prepare("SELECT current_serial FROM global_id_counter WHERE id = 'main'").get();
    const nextSerial = (row?.current_serial || 784) + 1;
    db.prepare("UPDATE global_id_counter SET current_serial = ? WHERE id = 'main'").run(nextSerial);
    return nextSerial;
  });

  const serial = getAndIncrement();
  const serialStr = String(serial).padStart(5, '0');
  const companyCode = 'AG';
  return `${prefix}/${companyCode}/${dateStr}/${serialStr}`;
}

function peekId(prefix, date) {
  const targetDate = date ? new Date(date) : new Date();
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const row = db.prepare("SELECT current_serial FROM global_id_counter WHERE id = 'main'").get();
  const nextSerial = (row?.current_serial || 784) + 1;
  const serialStr = String(nextSerial).padStart(5, '0');
  const companyCode = 'AG';
  return `${prefix}/${companyCode}/${dateStr}/${serialStr}`;
}

function getDocs() {
  return db.prepare("SELECT * FROM docs").all().map(d => ({
    ...d,
    synced: d.synced === 1
  }));
}

function saveDoc(docData) {
  db.prepare(`
    INSERT OR REPLACE INTO docs 
    (id, name, date, size, type, synced, category, propertyId, clientId, kissanId, ownerId, investorId, loanId, fileData, data, folder_id, category_id, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    docData.id, docData.name, docData.date, docData.size, docData.type, docData.synced ? 1 : 0, 
    docData.category, docData.propertyId, docData.clientId, docData.kissanId, docData.ownerId, docData.investorId, docData.loanId, docData.fileData,
    JSON.stringify(docData),
    docData.folder_id, docData.category_id, docData.created_at, docData.updated_at
  );
}

function deleteDoc(id) {
  db.prepare("DELETE FROM docs WHERE id = ?").run(id);
}

function clearLocalData() {
  const tables = ['settings', 'master_properties', 'clients', 'kissans', 'investors', 'loans', 'properties', 'transactions', 'referrals', 'docs', 'categories', 'folders', 'documents', 'gst_entries'];
  tables.forEach(table => {
    try {
      db.prepare(`DELETE FROM ${table}`).run();
    } catch (e) {
      console.error(`Error clearing table ${table}:`, e);
    }
  });
}

function getStorage() {
  const result = db.prepare("SELECT SUM(size) as totalSize FROM documents WHERE is_deleted = 0").get();
  return result ? (result.totalSize || 0) : 0;
}

function resetLedger() {
  const tables = [
    'clients',
    'transactions',
    'properties',
    'loans',
    'investors',
    'kissans',
    'referrals',
    'docs',
    'banks',
    'staff',
    'gst_entries'
  ];

  tables.forEach(table => {
    try {
      db.prepare(`DELETE FROM ${table}`).run();
    } catch (e) {
      console.error(`Error clearing ${table}:`, e);
    }
  });
}

ensureColumn("properties", "data", "TEXT");
ensureColumn("clients", "data", "TEXT");
ensureColumn("kissans", "data", "TEXT");
ensureColumn("investors", "data", "TEXT");
ensureColumn("loans", "data", "TEXT");
ensureColumn("referrals", "data", "TEXT");
ensureColumn("banks", "data", "TEXT");
ensureColumn("staff", "data", "TEXT");
ensureColumn("gst_entries", "data", "TEXT");
ensureColumn("folders", "is_starred", "INTEGER DEFAULT 0");
ensureColumn("documents", "is_starred", "INTEGER DEFAULT 0");
ensureColumn("documents", "is_deleted", "INTEGER DEFAULT 0");
ensureColumn("folders", "is_deleted", "INTEGER DEFAULT 0");
// ================= SYNC & INSTALLATION =================

function importSyncPackage(packageStr) {
  try {
    const pkg = typeof packageStr === 'string' ? JSON.parse(packageStr) : packageStr;
    const { data } = pkg;
    if (!data) throw new Error('Invalid sync package: no data');

    const tables = Object.keys(data);
    tables.forEach(table => {
      const rows = data[table];
      if (!Array.isArray(rows)) return;
      rows.forEach(row => {
        try {
          const cols = Object.keys(row);
          const placeholders = cols.map(() => '?').join(', ');
          const stmt = db.prepare(`INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`);
          stmt.run(...cols.map(c => row[c]));
        } catch (e) {
          console.warn(`Could not import row into ${table}:`, e.message);
        }
      });
    });
    return { success: true, tablesImported: tables.length };
  } catch (e) {
    console.error('importSyncPackage failed:', e);
    return { success: false, error: e.message };
  }
}

function exportSyncPackage() {
  const tables = [
    'categories', 'folders', 'documents', 'settings', 'master_properties',
    'clients', 'kissans', 'investors', 'loans', 'properties', 'transactions',
    'referrals', 'banks', 'staff', 'gst_entries', 'property_market_updates',
    'installation_state', 'machine_registration'
  ];
  
  const packageData = {};
  tables.forEach(table => {
    try {
      packageData[table] = db.prepare(`SELECT * FROM ${table}`).all();
    } catch (e) {
      console.warn(`Could not export table ${table}:`, e.message);
    }
  });

  return JSON.stringify({
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: packageData
  });
}

function getInstallationState() {
  const row = db.prepare("SELECT * FROM installation_state WHERE id = 1").get();
  if (!row) return { isInitialized: 0 };
  return { ...row, isInitialized: row.isInitialized === 1 };
}

function saveInstallationState(state) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO installation_state (id, mode, ledgerId, machineId, syncCode, serverUrl, isInitialized)
    VALUES (1, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    state.mode || 'Independent',
    state.ledgerId || null,
    state.machineId || null,
    state.syncCode || null,
    state.serverUrl || null,
    state.isInitialized ? 1 : 0
  );
}

function logSyncOperation(operation, tableName, rowId, data) {
  const state = getInstallationState();
  if (state.mode === 'Independent' || !state.isInitialized) return;

  const id = `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const machineId = state.machineId || 'unknown';
  
  db.prepare(`
    INSERT INTO sync_log (id, operation, tableName, rowId, data, machineId)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, operation, tableName, rowId.toString(), JSON.stringify(data), machineId);
}

function getSyncLogs(afterId) {
  if (afterId) {
    return db.prepare("SELECT * FROM sync_log WHERE id > ? ORDER BY timestamp ASC").all(afterId);
  }
  return db.prepare("SELECT * FROM sync_log ORDER BY timestamp ASC").all();
}

function registerMachine(machine) {
  db.prepare(`
    INSERT OR REPLACE INTO machine_registration (machineId, name, deviceType, lastSync)
    VALUES (?, ?, ?, ?)
  `).run(machine.machineId, machine.name, machine.deviceType, new Date().toISOString());
}

function getRegisteredMachines() {
  return db.prepare("SELECT * FROM machine_registration").all();
}

function applyRemoteOperation(log) {
  if (!log) return;
  const { operation, tableName, rowId, data, machineId } = log;
  if (!data) return;
  let parsedData;
  try {
    parsedData = JSON.parse(data);
  } catch (e) {
    console.error('[SYNC] Failed to parse remote operation data:', e);
    return;
  }
  const state = getInstallationState();
  
  if (machineId === state.machineId) return;
  
  try {
    const cols = Object.keys(parsedData);
    if (cols.length === 0) return;
    const placeholders = cols.map(() => '?').join(', ');
    const values = cols.map(c => {
      const v = parsedData[c];
      if (typeof v === 'object' && v !== null) return JSON.stringify(v);
      if (typeof v === 'boolean') return v ? 1 : 0;
      return v;
    });
    db.prepare(`INSERT OR REPLACE INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders})`).run(...values);
  } catch (e) {
    console.error(`[SYNC] Failed to apply remote operation to ${tableName}:`, e);
  }
}

function restoreFolder(id) {
  const stmt = db.prepare(`
    UPDATE folders 
    SET is_deleted = 0, deleted_at = NULL 
    WHERE id = ?
  `);
  stmt.run(id.toString());
  
  db.prepare(`
    UPDATE documents 
    SET is_deleted = 0, deleted_at = NULL 
    WHERE folder_id = ?
  `).run(id.toString());
}

function restoreDoc(id) {
  db.prepare(`
    UPDATE documents 
    SET is_deleted = 0, deleted_at = NULL 
    WHERE id = ?
  `).run(id.toString());
}

// ================= EXPORT =================

module.exports = {
  db,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getDeletedCategories,
  restoreCategory,
  permanentlyDeleteCategory,
  getFolders,
  saveFolder,
  updateFolder,
  deleteFolder,
  restoreFolder,
  restoreDoc,
  getDocuments,
  saveDocument,
  updateDocument,
  deleteDocument,
  getSettings,
  saveSettings,
  getMasterProperties,
  getMasterPropertyById,
  saveMasterProperty,
  getClients,
  getClientById,
  getTodayClientCount,
  saveClient,
  deleteClient,
  getKissans,
  getKissanById,
  saveKissan,
  deleteKissan,
  getInvestors,
  getInvestorById,
  saveInvestor,
  getLoans,
  getLoanById,
  saveLoan,
  deleteLoan,
  getProperties,
  getPropertyById,
  saveProperty,
  updateProperty,   
  deleteProperty,
  assignPlotToClient,
  getTransactions,
  saveTransaction,
  deleteTransaction,
  getReferrals,
  saveReferral,
  deleteReferral,
  getDocs,
  saveDoc,
  deleteDoc,
  generateId,
  peekId,
  getBanks,
  getBankById,
  saveBank,
  deleteBank,
  getStaff,
  getStaffById,
  saveStaff,
  deleteStaff,
  getPendingReceipts,
  savePendingReceipt,
  deletePendingReceipt,
  getGstEntries,
  saveGstEntry,
  deleteGstEntry,
  updateGstEntry,
  resetLedger,
  clearLocalData,
  getStorage,
  cleanupTrash,
  emptyTrash,
  getPropertyMarketUpdates,
  savePropertyMarketUpdate,
  deletePropertyMarketUpdate,
  getInstallationState,
  saveInstallationState,
  logSyncOperation,
  getSyncLogs,
  registerMachine,
  getRegisteredMachines,
  applyRemoteOperation,
  exportSyncPackage,
  importSyncPackage,
  restoreFolder,
  restoreDoc,
};
