const db = require('../database');
const bcrypt = require('bcrypt');

const admin = {
    getByUsername: function(username, callback) {
        console.log('Querying database for username:', username);
        db.query('SELECT * FROM admins WHERE username = ?', [username], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return callback(err, null);
            }
            console.log('Database query results:', results);
            callback(null, results);
        });
    },
    add: function(admin_data, callback) {
        bcrypt.hash(admin_data.password, 10, function(err, hashed_password) {
            if (err) {
                return callback(err);
            }
            db.query('INSERT INTO admins (username, password) VALUES (?, ?)', [admin_data.username, hashed_password], callback);
        });
    }
};

module.exports = admin;
