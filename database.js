const sqlite3 = require('sqlite3').verbose();

// Buat atau hubungkan ke database SQLite3
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Buat tabel users jika belum ada
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);
});

module.exports = db;