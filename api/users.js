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
