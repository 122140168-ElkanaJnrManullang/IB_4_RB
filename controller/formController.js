const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database (make sure this path is correct)
const dbPath = path.join(__dirname, '../data/database.db');
const db = new sqlite3.Database(dbPath);

// Function to save form data
exports.saveFormData = (req, res) => {
    const { name, age, height, weight, gender, allergy } = req.body;

    // Validation (make sure all fields are provided)
    if (!name || !age || !height || !weight || !gender || !allergy) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    // Database query to insert data
    const query = `
        INSERT INTO users (name, age, height, weight, gender, allergy)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [name, age, height, weight, gender, allergy], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to save data.' });
        }
        res.status(200).json({ message: 'Data saved successfully!', id: this.lastID });
    });
};