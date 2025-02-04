const db = require('../database'); // Tuodaan tietokantayhteys
const bcrypt = require('bcrypt'); // Tuodaan bcrypt-kirjasto salasanan hashaukseen

const Admin = { // Luodaan "Admin" -olio, joka sisältää tietokantafunktiot admin-käyttäjien käsittelyyn
    
    getAll: function(callback) { // Funktio, joka hakee kaikki adminit tietokannasta
        return db.query('SELECT * FROM admins', callback); // Suoritetaan SQL-kysely, joka hakee kaikki rivit "admins"-taulusta
    },

    getById: function(id, callback) { // Funktio, joka hakee adminin sen ID:n perusteella
        return db.query('SELECT * FROM admins WHERE id_admin=?', [id], callback); // Haetaan tietokannasta admin, jonka id_admin vastaa annettua ID:tä
    },

    getByUsername: (username, callback) => { // Funktio, joka hakee admin-käyttäjän tietokannasta käyttäjänimen perusteella
        const query = 'SELECT * FROM admins WHERE username=?'; // SQL-kysely, joka hakee adminin tietokannasta
        db.query(query, [username], (err, results) => { // Suoritetaan kysely tietokantaan ja annetaan käyttäjätunnus parametrina
            if (err) { // Jos kyselyssä tapahtuu virhe
                return callback(err); // Palautetaan virhe callback-funktiolle
            }
            if (results.length === 0) { // Jos hakutuloksia ei löydy, eli adminia ei ole tietokannassa
                return callback(null, null); // Palautetaan null, mikä tarkoittaa, ettei adminia löytynyt
            }
            return callback(null, results[0]); // Palautetaan ensimmäinen (ja ainoa) löydetty admin
        });
    },

    add: function(admin_data, callback) { // Funktio, joka lisää uuden adminin tietokantaan
        bcrypt.hash(admin_data.password, 10, function(err, hashed_password) { // Hashataan adminin salasana bcryptillä, käytetään suolauksena 10 kierrosta
            if (err) { // Jos salasanan hashauksessa tapahtuu virhe
                return callback(err); // Palautetaan virhe callback-funktiolle
            }
            const sanitizedHash = hashed_password.replace(/\//g, '_').replace(/\./g, '-');
            if (!sanitizedHash) {
                return callback(new Error('Password hashing failed')); // Palautetaan virhe, jos hashauksen tulos on tyhjä
            }
            db.query( // Suoritetaan SQL-kysely adminin lisäämiseksi tietokantaan
                'INSERT INTO admins (username, password) VALUES (?, ?)', // SQL-lause, joka lisää uuden adminin tietokantaan
                [admin_data.username, sanitizedHash], // Käytetään käyttäjätunnusta ja hashattua salasanaa parametrina
                callback // Suoritetaan callback-funktio kyselyn valmistuttua
            ); 
        });
    },

    updatePassword: function(id, password, callback) { // Funktio, joka päivittää adminin salasanan
        bcrypt.hash(password, 10, function(err, hashed_password) { // Hashataan uusi salasana bcryptillä, käytetään suolauksena 10 kierrosta
            if (err) { // Jos salasanan hashauksessa tapahtuu virhe
                return callback(err); // Palautetaan virhe callback-funktiolle
            }
            const sanitizedHash = hashed_password.replace(/\//g, '_').replace(/\./g, '-');
            if (!sanitizedHash) {
                return callback(new Error('Password hashing failed')); // Palautetaan virhe, jos hashauksen tulos on tyhjä
            }
            db.query( // Suoritetaan SQL-kysely adminin salasanan päivittämiseksi
                'UPDATE admins SET password=? WHERE id_admin=?', // SQL-lause, joka päivittää adminin salasanan
                [sanitizedHash, id], // Käytetään parametrina hashattua salasanaa ja adminin ID:tä
                callback // Kutsutaan callback-funktiota, kun päivitys on valmis
            );
        });
    },

    delete: function(id, callback) { // Funktio, joka poistaa adminin sen ID:n perusteella
        return db.query('DELETE FROM admins WHERE id_admin=?', [id], callback); // Suoritetaan SQL-kysely, joka poistaa adminin, jonka ID vastaa annettua ID:tä
    }
};

module.exports = Admin; // Viedään "Admin"-olio käytettäväksi muissa tiedostoissa
