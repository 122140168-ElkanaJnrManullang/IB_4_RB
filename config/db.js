
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',      // Host MySQL
    user: 'root',           // Username MySQL
    password: '',           // Password MySQL
    database: 'webIB', // Nama database
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const pool = require('./config/db');

pool.getConnection()
    .then(() => console.log('Connected to MySQL!'))
    .catch((err) => console.error('MySQL connection error:', err));


module.exports = pool;
