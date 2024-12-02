const express = require('express'); // Framework untuk membuat server
const cors = require('cors'); // Untuk mengatasi masalah CORS
const pool = require('./config/db'); // File konfigurasi koneksi MySQL
const authRoutes = require('./routes/authRoutes'); // Rute login

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Untuk menangani data JSON dari body request

// Routes
app.use('/api/auth', authRoutes);

// Test koneksi ke database
pool.getConnection()
    .then(() => {
        console.log('Connected to MySQL Database!');
        // Jalankan server
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error('Database connection failed:', err);
        process.exit(1); // Hentikan aplikasi jika gagal koneksi
    });
