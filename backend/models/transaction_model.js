const db = require('../database');

const transaction = {
    getAll: function(callback) {
        return db.query('SELECT * FROM transaction', callback);
    },

    getById: function(id, callback) {
        return db.query('SELECT * FROM transaction WHERE id_transaction = ?', [id], callback);
    },

    getByAccount: function(id_account, callback) {
        return db.query('SELECT * FROM transaction WHERE id_account = ?', [id_account], callback);
    },

    add: function(transaction_data, callback) {
        return db.query('INSERT INTO transaction (id_account, amount, type, date) VALUES (?, ?, ?, ?)', 
            [transaction_data.id_account, transaction_data.amount, transaction_data.type, transaction_data.date], callback);
    },

    update: function(id, transaction_data, callback) {
        return db.query('UPDATE transaction SET id_account = ?, amount = ?, type = ?, date = ? WHERE id_transaction = ?', 
            [transaction_data.id_account, transaction_data.amount, transaction_data.type, transaction_data.date, id], callback);
    },

    delete: function(id, callback) {
        return db.query('DELETE FROM transaction WHERE id_transaction = ?', [id], callback);
    },

    getUserTransactions: function(accountIds, callback) {
        console.log('Fetching transactions for account IDs:', accountIds);
        const query = `
            SELECT * 
            FROM transaction 
            WHERE id_account IN (?)
        `;
        db.query(query, [accountIds], function(err, results) {
            if (err) {
                console.error('Database query error:', err);
                return callback(err);
            }
            console.log('Transactions query results:', results);
            callback(null, results);
        });
    }
};

module.exports = transaction;