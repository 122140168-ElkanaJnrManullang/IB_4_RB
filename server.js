const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Import the controller
const formController = require('./controller/formController');
const mlController = require('./controller/mlController'); // Import mlController


// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.'))); // Serve static files

// Set up SQLite3 connection using a consistent path
const dbPath = path.join(__dirname, 'data', 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to SQLite database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database');
});

// Create table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        height REAL NOT NULL,
        weight REAL NOT NULL,
        gender TEXT NOT NULL,
        allergy TEXT NOT NULL
    )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', './isi-data.html'));
});

// Route untuk halaman rekomendasi
app.get('/rekomendasi', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'rekomendasi-or.html')); // Path sesuai
});

// POST route for saving user data - using the controller function
app.post('/api/submit-data', formController.saveFormData);

// GET route to fetch all users
app.get('/api/users', (req, res) => {
    const query = 'SELECT * FROM users';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ message: 'Failed to fetch data.' });
        }
        res.status(200).json(rows);
    });
});



// Middleware untuk menyimpan data dan memproses dengan machine learning
app.post('/api/process-data', (req, res) => {
    console.log('Request body:', req.body); // Debug input
    const { age, height, weight } = req.body;

    if (isNaN(age) || age <= 0 || isNaN(height) || height <= 0 || isNaN(weight) || weight <= 0) {
        console.error('Invalid input:', { age, height, weight }); // Log error input
        return res.status(400).json({ message: 'Invalid input data.' });
    }

    formController.saveFormData(req, res, () => {
        mlController.processUserData(req, res);
    });
});

app.get('/api/get-recommendations', (req, res) => {
    // Ambil data terakhir dari database
    const query = 'SELECT * FROM users ORDER BY id DESC LIMIT 1';
    db.get(query, [], (err, row) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ message: 'Failed to fetch data.' });
        }
        if (!row) {
            return res.status(404).json({ message: 'No data found.' });
        }

        // Kirim data ke mlController untuk diproses
        const data = {
            age: row.age,
            height: row.height,
            weight: row.weight
        };
        req.body = data; // Masukkan data ke req.body

        // Pastikan mlController.processUserData mengirim response JSON
        mlController.processUserData(req, res);
    });
});


// Start the server
const PORT = 8080;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});