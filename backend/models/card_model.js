const db = require('../database');
const bcrypt = require('bcrypt');

const card = {
    getAll: function(callback) {
        return db.query('SELECT * FROM card', callback);
    },

    getById: function(id, callback) {
        const query = `
            SELECT card.*, card_account.id_account 
            FROM card 
            JOIN card_account ON card.id_card = card_account.id_card 
            WHERE card.id_card = ?
        `;
        db.query(query, [id], function(err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    add: function(card_data, callback) {
        db.query('SELECT * FROM card WHERE card_number = ?', [card_data.card_number], function(err, existingCard) {
            if (err) {
                return callback(err);
            }
            if (existingCard.length > 0) {
                return callback(new Error('Card number already exists'));
            }
            bcrypt.hash(card_data.pin, 10, function(err, hashed_pin) {
                if (err) {
                    return callback(err);
                }
                db.query('INSERT INTO card(card_number, pin, retrys) VALUES(?,?,?)',
                    [card_data.card_number, hashed_pin, card_data.retrys], callback);
            });
        });
    },

    update: function(id, card_data, callback) {
        if (card_data.pin) {
            bcrypt.hash(card_data.pin, 10, function(err, hashed_pin) {
                if (err) {
                    return callback(err);
                }
                return db.query('UPDATE card SET card_number=?, pin=?, retrys=? WHERE id_card=?',
                    [card_data.card_number, hashed_pin, card_data.retrys, id], callback);
            });
        } else {
            return db.query('UPDATE card SET card_number=?, retrys=? WHERE id_card=?',
                [card_data.card_number, card_data.retrys, id], callback);
        }
    },

    delete: function(id, callback) {
        return db.query('DELETE FROM card WHERE id_card=?', [id], callback);
    },

    getUserAssets: function(card_number, callback) {
        const query = `
            SELECT account.id_account 
            FROM card_account 
            JOIN account ON card_account.id_account = account.id_account
            JOIN card ON card_account.id_card = card.id_card
            WHERE card.card_number = ?
        `;
        db.query(query, [card_number], function(err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    getByCardNumber: function(card_number, callback) {
        const query = `
            SELECT * 
            FROM card 
            WHERE card_number = ?
        `;
        db.query(query, [card_number], function(err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        });
    },

    getByCardNumberAndPin: function(card_number, pin, callback) {
        const query = 'SELECT * FROM card WHERE card_number = ?';
        db.query(query, [card_number], function(err, results) {
            if (err) {
                return callback(err);
            }
            const card = results[0];
            if (card) {
                bcrypt.compare(pin, card.pin, function(err, match) {
                    if (err) {
                        return callback(err);
                    }
                    if (match) {
                        return callback(null, card);
                    } else {
                        return callback(null, null);
                    }
                });
            } else {
                return callback(null, null);
            }
        });
    },

    /**
     * Increment the retrys field for a card
     * @param {number} cardId - The ID of the card
     * @param {function} callback - The callback function
     */
    incrementRetries: function(cardId, callback) {
        const query = 'UPDATE card SET retrys = retrys + 1 WHERE id_card = ?';
        db.query(query, [cardId], callback);
    },

    /**
     * Reset the retrys field for a card
     * @param {number} cardId - The ID of the card
     * @param {function} callback - The callback function
     */
    resetRetries: function(cardId, callback) {
        const query = 'UPDATE card SET retrys = 0 WHERE id_card = ?';
        db.query(query, [cardId], callback);
    }
};

module.exports = card;