const db = require('../database');

const account = {
    getAll: function(callback) {
        return db.query('SELECT * FROM account', callback);
    },

    getById: function(id, callback) {
        return db.query('SELECT * FROM account WHERE id_account=?', [id], function(err, results) {
            if (err) {
                return callback(err);
            }
            if (results.length === 0) {
                return callback(new Error('Account not found'));
            }
            callback(null, results[0]);
        });
    },

    getByUserId: function(id, callback) {
        return db.query('SELECT * FROM account WHERE id_user=?', [id], callback);
    },

    add: function(account_data, callback) {
        return db.query('INSERT INTO account (amount, `limit`, balance, id_user) VALUES(?,?,?,?)', 
            [account_data.amount, account_data.limit, account_data.balance, account_data.id_user], callback);
    },

    delete: function(id, callback) {
        return db.query('DELETE FROM account WHERE id_account=?', [id], callback);
    },

    update: function(id, account_data, callback) {
        return db.query('UPDATE account SET amount=?, `limit`=?, balance=?, id_user=? WHERE id_account=?', 
            [account_data.amount, account_data.limit, account_data.balance, account_data.id_user, id], callback);
    },

    checkBalance: function(accountId, amount, callback) {
        db.query('SELECT balance, `limit` FROM account WHERE id_account = ?', [accountId], (err, result) => {
            if (err) {
                return callback(err);
            }
            const { balance, limit } = result[0];
            callback(null, balance - amount >= -limit);
        });
    },

    withdrawAmount: function(accountId, amount, callback) {
        db.query('UPDATE account SET balance = balance - ? WHERE id_account = ?', [amount, accountId], (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },

    getBalance: function(accountId, callback) {
        db.query('SELECT balance FROM account WHERE id_account = ?', [accountId], function(err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, parseFloat(results[0].balance));
        });
    },

    /**
     * Get the account type by account ID
     * @param {number} accountId - The ID of the account
     * @param {function} callback - The callback function
     */
    getAccountType: function(accountId, callback) {
        const query = 'SELECT type FROM account WHERE id_account = ?'; // Updated column name to 'type'
        db.query(query, [accountId], (err, results) => {
            if (err) {
                return callback(err);
            }
            if (results.length === 0) {
                return callback(new Error('Account not found'));
            }
            callback(null, results[0].type);
        });
    },

    /**
     * Get the available credit for a credit account by account ID
     * @param {number} accountId - The ID of the account
     * @param {function} callback - The callback function
     */
    getAvailableCredit: function(accountId, callback) {
        const query = 'SELECT balance, `limit` FROM account WHERE id_account = ?';
        db.query(query, [accountId], (err, results) => {
            if (err) {
                return callback(err);
            }
            if (results.length === 0) {
                return callback(new Error('Account not found'));
            }
            const { balance, limit } = results[0];
            const availableCredit = parseFloat(limit) + parseFloat(balance);
            callback(null, availableCredit);
        });
    }
};

module.exports = account;