const bcrypt = require('bcrypt');
const db = require('./database');

async function seed() {
    const users = [
        { email: 'user1@example.com', password: 'asdfgh' },
        { email: 'user2@example.com', password: 'qwerty' }
    ];

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        db.run(
            `INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)`,
            [user.email, hashedPassword],
            (err) => {
                if (err) {
                    console.error('Error inserting user:', err.message);
                } else {
                    console.log(`User ${user.email} added.`);
                }
            }
        );
    }
}

seed();
