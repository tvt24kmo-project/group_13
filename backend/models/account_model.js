const db = require('../database'); // Tuodaan tietokantayhteys

const account = { // Luodaan "account"-olio, joka sisältää erilaisia tietokantakyselyitä liittyen tileihin
    
    getAll: function(callback) { // Funktio, joka hakee kaikki tilit tietokannasta
        return db.query('SELECT * FROM account', callback); // Suoritetaan SQL-kysely, joka hakee kaikki tilit taulusta "account"
    },

    getById: function(id, callback) { // Funktio, joka hakee yksittäisen tilin sen ID:n perusteella
        return db.query('SELECT * FROM account WHERE id_account=?', [id], function(err, results) { 
            if (err) { // Jos tapahtuu virhe tietokantakyselyssä
                return callback(err); // Palautetaan virhe callback-funktiolle
            }
            if (results.length === 0) { // Jos tiliä ei löydy annetulla ID:llä
                return callback(new Error('Account not found')); // Palautetaan virheilmoitus
            }
            callback(null, results[0]); // Palautetaan ensimmäinen (ja ainoa) löydetty tili
        });
    },

    getByUserId: function(id, callback) { // Funktio, joka hakee kaikki tietyn käyttäjän tilit käyttäjän ID:n perusteella
        return db.query('SELECT * FROM account WHERE id_user=?', [id], callback); // Suoritetaan SQL-kysely, joka hakee käyttäjän tilit
    },

    add: function(account_data, callback) { // Funktio, joka lisää uuden tilin tietokantaan
        return db.query('INSERT INTO account (amount, `limit`, balance, id_user) VALUES(?,?,?,?)',
            [account_data.amount, account_data.limit, account_data.balance, account_data.id_user], callback); // Syötetään annetut tiedot tietokantaan
    },

    delete: function(id, callback) { // Funktio, joka poistaa tilin sen ID:n perusteella
        return db.query('DELETE FROM account WHERE id_account=?', [id], callback); // Suoritetaan SQL-kysely, joka poistaa tilin
    },

    update: function(id, account_data, callback) { // Funktio, joka päivittää olemassa olevan tilin tiedot
        return db.query('UPDATE account SET amount=?, `limit`=?, balance=?, id_user=? WHERE id_account=?', 
            [account_data.amount, account_data.limit, account_data.balance, account_data.id_user, id], callback); // Päivitetään annetut tiedot tilille
    },

    checkBalance: function(accountId, amount, callback) { // Funktio, joka tarkistaa, onko tilillä tarpeeksi saldoa tiettyyn nostoon tai ostoon
        db.query('SELECT balance, `limit` FROM account WHERE id_account = ?', [accountId], (err, result) => { 
            if (err) { // Jos tietokantakyselyssä tapahtuu virhe
                return callback(err); // Palautetaan virhe callback-funktiolle
            }
            const { balance, limit } = result[0]; // Erotellaan haettu saldo ja luottoraja
            callback(null, balance - amount >= -limit); // Tarkistetaan, voidaanko pyydetty summa vähentää ottaen huomioon luottoraja
        });
    },

    withdrawAmount: function(accountId, amount, callback) { // Funktio, joka nostaa tietyn summan tililtä
        db.query('UPDATE account SET balance = balance - ? WHERE id_account = ?', [amount, accountId], (err, result) => { 
            if (err) { // Jos tietokantakyselyssä tapahtuu virhe
                return callback(err); // Palautetaan virhe callback-funktiolle
            }
            callback(null, result); // Palautetaan onnistunut tulos
        });
    },

    getBalance: function(accountId, callback) { // Funktio, joka hakee tilin nykyisen saldon
        db.query('SELECT balance FROM account WHERE id_account = ?', [accountId], function(err, results) {  
            if (err) { // Jos tapahtuu virhe
                return callback(err); // Palautetaan virhe callbackiin
            }
            callback(null, parseFloat(results[0].balance)); // Palautetaan tilin saldo numeerisena arvona
        });
    },

    getAccountType: function(accountId, callback) { // Funktio, joka hakee tilin tyypin tilin ID:n perusteella
        const query = 'SELECT type FROM account WHERE id_account = ?'; // SQL-kysely, joka hakee tilin tyypin
        db.query(query, [accountId], (err, results) => { 
            if (err) { // Jos tapahtuu virhe
                return callback(err); // Palautetaan virhe callback-funktiolle
            }
            if (results.length === 0) { // Jos tilin tietoja ei löydy
                return callback(new Error('Account not found')); // Palautetaan virheilmoitus
            }
            callback(null, results[0].type); // Palautetaan tilin tyyppi
        });
    },

    getAvailableCredit: function(accountId, callback) { // Funktio, joka laskee käytettävissä olevan luoton määrän
        const query = `
            SELECT a.balance, a.\`limit\`, ca.account_type 
            FROM account a 
            JOIN card_account ca ON a.id_account = ca.id_account 
            WHERE a.id_account = ?
        `; // SQL-kysely, joka hakee tilin saldon, luottorajan ja tilin tyypin

        db.query(query, [accountId], (err, results) => { // Suoritetaan kysely
            if (err) { // Jos tapahtuu virhe
                return callback(err); // Palautetaan virhe callback-funktiolle
            }
            if (results.length === 0) { // Jos tilin tietoja ei löydy
                return callback(new Error('Account not found')); // Palautetaan virheilmoitus
            }
            const { balance, limit, account_type } = results[0]; // Erotellaan haettu saldo, luottoraja ja tilin tyyppi
            if (account_type === 'credit') { // Jos tili on luottotili
                const availableCredit = parseFloat(limit) + parseFloat(balance); // Lasketaan käytettävissä oleva luotto
                callback(null, availableCredit); // Palautetaan tulos
            } else { // Jos tili on debit-tili
                callback(null, parseFloat(balance)); // Palautetaan saldo
            }
        });
    }
};

module.exports = account; // Viedään "account"-olio käytettäväksi muissa tiedostoissa
