const dotenv = require('dotenv');
const db = require('./database');
const bcrypt = require('bcrypt');

dotenv.config();

async function createDefaultAdmin() {
    const adminId = 1;
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    try {
        // Check if admin with ID 1 already exists
        const [existingAdmin] = await db.query('SELECT * FROM admins WHERE id_admin = ?', [adminId]);
        if (existingAdmin.length > 0) {
            console.log('Admin with ID 1 already exists. Script will now exit.');
            process.exit(0);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new admin user with ID 1
        await db.query('INSERT INTO admins (id_admin, username, password) VALUES (?, ?, ?)', [adminId, username, hashedPassword]);
        console.log('Default admin user created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating default admin user:', err);
        process.exit(1);
    }
}

createDefaultAdmin();
