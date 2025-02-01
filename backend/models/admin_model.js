const db = require('../database');
const bcrypt = require('bcrypt');

const Admin = {
    getByUsername: (username, callback) => {
        const query = 'SELECT * FROM admins WHERE username = ?';
        db.query(query, [username], (err, results) => {
            if (err) {
                return callback(err);
            }
            if (results.length === 0) {
                return callback(null, null);
            }
            return callback(null, results[0]);
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

module.exports = Admin;
