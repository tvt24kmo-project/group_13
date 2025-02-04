const db = require('../database'); // Tuodaan tietokantayhteys, jotta voidaan suorittaa SQL-kyselyitä

const card_account = { // Luodaan "card_account" -olio, joka sisältää tietokantafunktiot korttitilien käsittelyyn
    
    getAll: function(callback) { // Funktio, joka hakee kaikki korttitilit tietokannasta
        return db.query('SELECT * FROM card_account', callback); // Suoritetaan SQL-kysely, joka hakee kaikki rivit "card_account"-taulusta
    },

    getById: function(id, callback) { // Funktio, joka hakee korttitilin sen ID:n perusteella
        return db.query('SELECT * FROM card_account WHERE id_card_account=?', [id], callback); // Haetaan tietokannasta korttitili, jonka id_card_account vastaa annettua ID:tä
    },

    add: function(card_account_data, callback) { // Funktio, joka lisää uuden korttitilin tietokantaan
        return db.query( // Suoritetaan SQL-kysely uuden korttitilin lisäämiseksi
            'INSERT INTO card_account (id_card, id_account, account_type) VALUES(?,?,?)', // SQL-lause, joka lisää uuden korttitilin "card_account"-tauluun
            [card_account_data.id_card, card_account_data.id_account, card_account_data.account_type], // Käytetään parametrina kortin ID:tä, tilin ID:tä ja tilin tyyppiä
            callback // Kutsutaan callback-funktiota, kun lisäys on suoritettu
        );
    },

    delete: function(id, callback) { // Funktio, joka poistaa korttitilin sen ID:n perusteella
        return db.query('DELETE FROM card_account WHERE id_card_account=?', [id], callback); // Suoritetaan SQL-kysely, joka poistaa korttitilin, jonka ID vastaa annettua ID:tä
    },

    update: function(id, card_account_data, callback) { // Funktio, joka päivittää olemassa olevan korttitilin tiedot
        return db.query( // Suoritetaan SQL-kysely korttitilin päivittämiseksi
            'UPDATE card_account SET id_card=?, id_account=?, account_type=? WHERE id_card_account=?', // SQL-lause, joka päivittää korttitilin tiedot
            [card_account_data.id_card, card_account_data.id_account, card_account_data.account_type, id], // Käytetään parametrina uusia arvoja ja korttitilin ID:tä
            callback // Kutsutaan callback-funktiota, kun päivitys on valmis
        );
    },

    getByCardId: function(cardId, callback) { // Funktio, joka hakee korttitilin kortin ID:n perusteella
        return db.query('SELECT * FROM card_account WHERE id_card = ?', [cardId], callback); // Suoritetaan SQL-kysely, joka hakee kaikki korttitilit, joissa id_card vastaa annettua ID:tä
    },

    /**
     * Funktio, joka hakee korttitilin tilin ID:n perusteella
     * @param {number} accountId - Tilin tunnus (ID)
     * @param {function} callback - Callback-funktio, joka käsittelee haetun tiedon
     */
    getByAccountId: function(accountId, callback) { // Funktio, joka hakee korttitilin tilin ID:n perusteella
        const query = 'SELECT * FROM card_account WHERE id_account = ?'; // SQL-kysely korttitilin hakemiseksi tilin ID:n perusteella
        db.query(query, [accountId], (err, results) => { // Suoritetaan SQL-kysely tietokantaan ja annetaan tilin ID parametrina
            if (err) { // Jos kyselyssä tapahtuu virhe
                return callback(err); // Palautetaan virhe callback-funktiolle
            }
            if (results.length === 0) { // Jos tuloksia ei löydy eli korttitiliä ei ole kyseiselle tilille
                return callback(new Error('Card account not found')); // Palautetaan virheilmoitus
            }
            callback(null, results[0]); // Palautetaan ensimmäinen löytynyt korttitili
        });
    },

    getAccountType: function(accountId, callback) { // Funktio, joka hakee tilin tyypin tilin ID:n perusteella
        const query = 'SELECT account_type FROM card_account WHERE id_account = ?'; // SQL-kysely, joka hakee tilin tyypin
        db.query(query, [accountId], (err, results) => { 
            if (err) { // Jos tapahtuu virhe
                return callback(err); // Palautetaan virhe callback-funktiolle
            }
            if (results.length === 0) { // Jos tilin tietoja ei löydy
                return callback(new Error('Account not found')); // Palautetaan virheilmoitus
            }
            callback(null, results[0].account_type); // Palautetaan tilin tyyppi
        });
    }
};

module.exports = card_account; // Viedään "card_account"-olio käytettäväksi muissa tiedostoissa
