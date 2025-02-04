const db = require('../database'); // Tuodaan tietokantayhteys

const transaction = { // Luodaan "transaction" -olio, joka sisältää useita funktioita

    getAll: function(callback) { // Funktio, joka hakee kaikki tapahtumat tietokannasta
        return db.query('SELECT * FROM transaction', callback); // Suoritetaan SQL-kysely, joka hakee kaikki tapahtumat tietokannasta 
    },

    getById: function(id, callback) { // Funktio, joka hakee tapahtuman sen ID:n perusteella 
        return db.query('SELECT * FROM transaction WHERE id_transaction = ?', [id], callback); // Suoritetaan SQL-kysely, joka hakee tapahtuman sen ID:n perusteella
    },

    getByAccount: function(id_account, callback) { // Funktio, joka hakee tapahtumat tilin ID:n perusteella 
        return db.query('SELECT * FROM transaction WHERE id_account = ?', [id_account], callback); // Suoritetaan SQL-kysely, joka hakee tapahtumat tilin ID:n perusteella
    },

    getByAccountId: function(accountId, limit, offset, callback) { // Funktio, joka hakee tapahtumat tilin ID:n perusteella 
        const query = `
            SELECT * FROM transaction 
            WHERE id_account = ? 
            ORDER BY date DESC 
            LIMIT ? OFFSET ?
        `; // SQL-kysely, joka hakee tapahtumat tilin ID:n perusteella, järjestää ne päivämäärän mukaan laskevassa järjestyksessä, ja rajaa tulosten määrän
        db.query(query, [accountId, limit, offset], function(err, results) { // Suoritetaan SQL-kysely tietokantaan 
            if (err) { // Jos tapahtuu virhe 
                return callback(err); // Palautetaan virhe callbackiin
            }
            callback(null, results); // Palautetaan tulokset 
        });
    },

    add: function(transaction_data, callback) { // Funktio, joka lisää uuden tapahtuman tietokantaan 
        return db.query('INSERT INTO transaction (transaction_type, sum, date, type, id_account) VALUES (?, ?, ?, ?, ?)', // Suoritetaan SQL-kysely, jossa lisätään uusi tapahtuma tietokantaan 
            [transaction_data.transaction_type, transaction_data.sum, transaction_data.date, transaction_data.type, transaction_data.id_account], callback); // Lisätään uusi tapahtuma tietokantaan 
    },

    update: function(id, transaction_data, callback) { // Funktio, joka päivittää olemassa olevan tapahtuman tiedot 
        return db.query('UPDATE transaction SET transaction_type = ?, sum = ?, date = ?, type = ?, id_account = ? WHERE id_transaction = ?', // Suoritetaan SQL-kysely, joka päivittää olemassa olevan tapahtuman tiedot tietokantaan 
            [transaction_data.transaction_type, transaction_data.sum, transaction_data.date, transaction_data.type, transaction_data.id_account, id], callback); // Päivitetään olemassa olevan tapahtuman tiedot tietokantaan 
    },

    delete: function(id, callback) { // Funktio, joka poistaa tapahtuman sen ID:n perusteella 
        return db.query('DELETE FROM transaction WHERE id_transaction = ?', [id], callback); // Suoritetaan SQL-kysely, joka poistaa tapahtuman sen ID:n perusteella 
    },

    create: function(transactionData, callback) { // Funktio, joka lisää uuden tapahtuman tietokantaan
        const { transaction_type, sum, date, type, id_account } = transactionData; // Erotellaan transactionData-objektin kentät omiksi muuttujiksi
        db.query( // Suoritetaan SQL-kysely, jossa lisätään uusi tapahtuma tietokantaan 
            'INSERT INTO transaction (transaction_type, sum, date, type, id_account) VALUES (?, ?, ?, ?, ?)', // SQL-kysely, joka lisää uuden tapahtuman tietokantaan
            [transaction_type, sum, date || new Date(), type, id_account], callback // Lisätään uusi tapahtuma tietokantaan 
        );
    }
};

module.exports = transaction; // Viedään "transaction"-olio käytettäväksi muissa tiedostoissa
