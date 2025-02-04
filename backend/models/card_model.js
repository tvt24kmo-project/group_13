const db = require('../database'); // Tuodaan tietokantayhteys
const bcrypt = require('bcrypt'); // Tuodaan bcrypt-kirjasto salasanan hashaukseen

const card = { // Luodaan "card" -olio, joka sisältää useita funktioita

    getAll: function(callback) { // Funktio, joka hakee kaikki kortit tietokannasta
        return db.query('SELECT * FROM card', callback); // Suoritetaan SQL-kysely, joka hakee kaikki kortit tietokannasta
    },

    getById: function(id, callback) { // Funktio, joka hakee kortin sen ID:n perusteella
        const query = ` 
            SELECT card.*, card_account.id_account 
            FROM card 
            JOIN card_account ON card.id_card = card_account.id_card 
            WHERE card.id_card = ?
        `; // SQL-kysely, joka hakee kortin ja siihen liittyvän tilin ID:n
        db.query(query, [id], function(err, results) { // Suoritetaan SQL-kysely, joka hakee kortin sen ID:n perusteella
            if (err) { // Jos tapahtuu virhe
                return callback(err); // Palautetaan virhe callbackiin
            }
            callback(null, results); // Palautetaan tulokset
        });
    },

    add: function(card_data, callback) { // Funktio, joka lisää uuden kortin tietokantaan
        db.query('SELECT * FROM card WHERE card_number = ?', [card_data.card_number], function(err, existingCard) { // Tarkistetaan, onko kortti jo olemassa
            if (err) { // Jos tapahtuu virhe
                return callback(err); // Palautetaan virhe callbackiin
            }
            if (existingCard.length > 0) { // Jos kortti on jo olemassa tietokannassa
                return callback(new Error('Card number already exists')); // Palautetaan virhe, jos kortti on jo olemassa
            }
            bcrypt.hash(card_data.pin, 10, function(err, hashed_pin) { // Hashataan kortin pin-koodi bcryptillä
                if (err) { // Jos tapahtuu virhe
                    return callback(err); // Palautetaan virhe callbackiin
                }
                db.query('INSERT INTO card(card_number, pin, retrys) VALUES(?,?,?)', // Suoritetaan SQL-kysely, joka lisää uuden kortin tietokantaan
                    [card_data.card_number, hashed_pin, card_data.retrys], callback); // Lisätään uusi kortti tietokantaan
            });
        });
    },

    update: function(id, card_data, callback) { // Funktio, joka päivittää olemassa olevan kortin tiedot
        if (card_data.pin) { // Jos kortin pin-koodi on annettu
            bcrypt.hash(card_data.pin, 10, function(err, hashed_pin) { // Hashataan kortin pin-koodi bcryptillä
                if (err) { // Jos tapahtuu virhe
                    return callback(err); // Palautetaan virhe callbackiin
                }
                return db.query('UPDATE card SET card_number=?, pin=?, retrys=? WHERE id_card=?', // Suoritetaan SQL-kysely, joka päivittää kortin tiedot
                    [card_data.card_number, hashed_pin, card_data.retrys, id], callback); // Päivitetään kortin tiedot tietokantaan
            });
        } else { // Jos kortin pin-koodia ei ole annettu
            return db.query('UPDATE card SET card_number=?, retrys=? WHERE id_card=?', // Suoritetaan SQL-kysely, joka päivittää kortin tiedot
                [card_data.card_number, card_data.retrys, id], callback); // Päivitetään kortin tiedot tietokantaan
        }
    },

    delete: function(id, callback) { // Funktio, joka poistaa kortin sen ID:n perusteella
        return db.query('DELETE FROM card WHERE id_card=?', [id], callback); // Suoritetaan SQL-kysely, joka poistaa kortin sen ID:n perusteella
    },

    getUserAssets: function(card_number, callback) { // Funktio, joka hakee käyttäjän varat kortin numeron perusteella
        const query = `
            SELECT account.id_account 
            FROM card_account 
            JOIN account ON card_account.id_account = account.id_account
            JOIN card ON card_account.id_card = card.id_card
            WHERE card.card_number = ?
        `; // SQL-kysely, joka hakee tilin ID:n kortin numeron perusteella
        db.query(query, [card_number], function(err, results) { // Suoritetaan SQL-kysely, joka hakee käyttäjän varat kortin numeron perusteella
            if (err) { // Jos tapahtuu virhe
                return callback(err); // Palautetaan virhe callbackiin
            }
            callback(null, results); // Palautetaan tulokset
        });
    },

    getByCardNumber: function(card_number, callback) { // Funktio, joka hakee kortin kortin numeron perusteella
        const query = `
            SELECT * 
            FROM card 
            WHERE card_number = ?
        `; // SQL-kysely, joka hakee kortin kortin numeron perusteella
        db.query(query, [card_number], function(err, results) { // Suoritetaan SQL-kysely, joka hakee kortin kortin numeron perusteella
            if (err) { // Jos tapahtuu virhe
                return callback(err); // Palautetaan virhe callbackiin
            }
            callback(null, results[0]); // Palautetaan ensimmäinen tulos
        });
    },

    getByCardNumberAndPin: function(card_number, pin, callback) { // Funktio, joka hakee kortin kortin numeron ja pin-koodin perusteella
        const query = 'SELECT * FROM card WHERE card_number = ?'; // SQL-kysely, joka hakee kortin kortin numeron perusteella
        db.query(query, [card_number], function(err, results) { // Suoritetaan SQL-kysely, joka hakee kortin kortin numeron perusteella
            if (err) { // Jos tapahtuu virhe
                return callback(err); // Palautetaan virhe callbackiin
            }
            const card = results[0]; // Tallennetaan ensimmäinen tulos muuttujaan
            if (card) { // Jos kortti löytyy
                bcrypt.compare(pin, card.pin, function(err, match) { // Vertaillaan annettua pin-koodia ja tietokannassa olevaa pin-koodia
                    if (err) { // Jos tapahtuu virhe
                        return callback(err); // Palautetaan virhe callbackiin
                    }
                    if (match) { // Jos pin-koodit täsmäävät
                        return callback(null, card); // Palautetaan kortti
                    } else { // Jos pin-koodit eivät täsmää
                        return callback(null, null); // Palautetaan null
                    }
                });
            } else { // Jos korttia ei löydy
                return callback(null, null); // Palautetaan null
            }
        });
    },

    /**
     * Funktio, joka kasvattaa kortin retrys-kentän arvoa
     * @param {number} cardId - Kortin tunnus (ID)
     * @param {function} callback - Takaisinkutsufunktio (callback)
     */
    incrementRetries: function(cardId, callback) { // Funktio, joka kasvattaa kortin retrys-kentän arvoa
        const query = 'UPDATE card SET retrys = retrys + 1 WHERE id_card = ?'; // SQL-kysely, joka kasvattaa kortin retrys-kentän arvoa
        db.query(query, [cardId], callback); // Suoritetaan SQL-kysely tietokantaan
    },

    /**
     * Funktio, joka nollaa kortin retrys-kentän arvon
     * @param {number} cardId - Kortin tunnus (ID)
     * @param {function} callback - Takaisinkutsufunktio (callback)
     */
    resetRetries: function(cardId, callback) { // Funktio, joka nollaa kortin retrys-kentän arvon
        const query = 'UPDATE card SET retrys = 0 WHERE id_card = ?'; // SQL-kysely, joka nollaa kortin retrys-kentän arvon
        db.query(query, [cardId], callback); // Suoritetaan SQL-kysely tietokantaan
    }
};

module.exports = card; // Viedään "card"-olio käytettäväksi muissa tiedostoissa
