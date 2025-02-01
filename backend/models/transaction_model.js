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

    getByAccountId: function(accountId, limit, offset, callback) {
        const query = `
            SELECT * FROM transaction 
            WHERE id_account = ? 
            ORDER BY date DESC 
            LIMIT ? OFFSET ?
        `;
        db.query(query, [accountId, limit, offset], function(err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    add: function(transaction_data, callback) {
        return db.query('INSERT INTO transaction (transaction_type, sum, date, type, id_account) VALUES (?, ?, ?, ?, ?)', 
            [transaction_data.transaction_type, transaction_data.sum, transaction_data.date, transaction_data.type, transaction_data.id_account], callback);
    },

    update: function(id, transaction_data, callback) {
        return db.query('UPDATE transaction SET transaction_type = ?, sum = ?, date = ?, type = ?, id_account = ? WHERE id_transaction = ?', 
            [transaction_data.transaction_type, transaction_data.sum, transaction_data.date, transaction_data.type, transaction_data.id_account, id], callback);
    },

    delete: function(id, callback) {
        return db.query('DELETE FROM transaction WHERE id_transaction = ?', [id], callback);
    },

    create: function(transactionData, callback) {
        const { transaction_type, sum, date, type, id_account } = transactionData;
        db.query(
            'INSERT INTO transaction (transaction_type, sum, date, type, id_account) VALUES (?, ?, ?, ?, ?)',
            [transaction_type, sum, date || new Date(), type, id_account], callback
        );
    }
};

module.exports = transaction;