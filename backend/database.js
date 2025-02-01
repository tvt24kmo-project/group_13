const dotenv = require('dotenv');
const mysql = require('mysql2'); // Use the normal version

dotenv.config();
const connection = mysql.createPool({
    uri: process.env.SQL_SERVER
});

connection.getConnection((err, conn) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    } else {
        console.log('Connected to the database.');
        conn.release();
    }
});

module.exports = connection;