const db=require('../database');
const { getById } = require('./account_model');

const transaction = {
    
    getAll: function (callback) {
      return db.query('SELECT * FROM transaction', callback);
    },
  
    
    getById: function (id, callback) {
      return db.query('SELECT * FROM transaction WHERE id_transaction = ?', [id], callback);
    },
  
    
    add: function (transaction_data, callback) {
        // Tarkistetaan, onko tilillä tarpeeksi rahaa
        db.query('SELECT balance FROM account WHERE id_account = ?', [transaction_data.id_account],
             (err, accountResults) => {
          if (err) return callback(err);
      
          if (accountResults.length === 0) {
            return callback(null, { error: 'Account not found', statusCode: 404 });
          }
      
          const currentBalance = accountResults[0].balance;
      
          if (transaction_data.transaction_type === 'withdraw' && currentBalance < transaction_data.sum) {
            return callback(null, { error: 'Insufficient funds', statusCode: 400 });
          }
      
          // Luodaan uusi tapahtuma
          db.query( // Lisätään tietokantaan uusi tapahtuma
            'INSERT INTO transaction (transaction_type, sum, date, type, id_account) VALUES (?, ?, ?, ?, ?)',
            [
              transaction_data.transaction_type,
              transaction_data.sum,
              transaction_data.date,
              transaction_data.type,
              transaction_data.id_account
            ],// Tarkistetaan, onko tilillä tarpeeksi rahaa
            (err, results) => {
              if (err) return callback(err);
      
                // Päivitetään tilin saldo
              const balanceUpdateQuery = transaction_data.transaction_type === 'withdraw'
                ? 'UPDATE account SET balance = balance - ? WHERE id_account = ?'
                : 'UPDATE account SET balance = balance + ? WHERE id_account = ?';
      
              db.query(balanceUpdateQuery, [transaction_data.sum, transaction_data.id_account], (err) => {
                if (err) return callback(err);
      
                callback(null, { message: 'Transaction created and balance updated', transactionId: results.insertId });
              });
            }
          );
        });
      },
  
    // Päivitä tietoja
    update: function (id, transaction_data, callback) {
        const { transaction_type, sum, date, type, id_account } = transaction_data;
        db.query(
          'UPDATE transaction SET transaction_type = ?, sum = ?, date = ?, type = ?, id_account = ? WHERE id_transaction = ?',
          [transaction_type, sum, date, type, id_account, id],
          callback
        );
      },
  
    // Poista tieto
    delete: function (id, callback) {
      db.query('DELETE FROM transaction WHERE id_transaction = ?', [id], callback);
    }
  };











module.exports=transaction;