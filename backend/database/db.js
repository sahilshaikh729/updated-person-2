const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'drone_events.db');

// Ensure parent directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Failed to connect to SQLite database:', err.message);
    } else {
        console.log(`✅ SQLite Database connected at: ${dbPath}`);
    }
});

// Enable WAL mode and foreign keys for performance and stability
db.serialize(() => {
    db.run('PRAGMA journal_mode = WAL;');
    db.run('PRAGMA foreign_keys = ON;');
});

// Initialize database schema from schema.sql
function initDatabase() {
    return new Promise((resolve, reject) => {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        db.exec(schemaSql, (err) => {
            if (err) {
                console.error('❌ Database schema initialization error:', err.message);
                return reject(err);
            }
            console.log('✅ Database schema initialized successfully');
            resolve();
        });
    });
}

// Promisified query helpers
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

module.exports = {
    db,
    initDatabase,
    run,
    get,
    all
};
