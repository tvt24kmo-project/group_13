const dotenv = require('dotenv');
const db = require('./database');
const bcrypt = require('bcrypt');
const admin = require('./models/admin_model');

dotenv.config();

function createDefaultAdmin() {
    const adminId = 1;
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    // Check if admin with ID 1 already exists
    db.query('SELECT * FROM admins WHERE id_admin = ?', [adminId], function(err, existingAdmin) {
        if (err) {
            console.error('Error checking for existing admin:', err);
            process.exit(1);
        }
        if (existingAdmin.length > 0) {
            console.error('Admin with ID 1 already exists. Script will now exit.');
            process.exit(1);
        }

        // Hash the password
        bcrypt.hash(password, 10, function(err, hashedPassword) {
            if (err) {
                console.error('Error hashing password:', err);
                process.exit(1);
            }

            // Insert the new admin user with ID 1
            db.query('INSERT INTO admins (id_admin, username, password) VALUES (?, ?, ?)', [adminId, username, hashedPassword], function(err, result) {
                if (err) {
                    console.error('Error creating default admin user:', err);
                    process.exit(1);
                }
                console.log('Default admin user created successfully.');
            });
        });
    });
}

createDefaultAdmin();
