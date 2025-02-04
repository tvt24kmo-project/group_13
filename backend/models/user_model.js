const db = require('../database'); // Tuodaan tietokantayhteys 

const user = { // Luodaan "user" -olio, joka sisältää useita funktioita 

    getAll: function(callback) { // Funktio, joka hakee kaikki käyttäjät tietokannasta 
        return db.query('SELECT * FROM user', callback); // Suoritetaan SQL-kysely, joka hakee kaikki käyttäjät tietokannasta 
    },

    getById: function(id, callback) { // Funktio, joka hakee käyttäjän sen ID:n perusteella 
        return db.query('SELECT * FROM user WHERE id_user=?', [id], callback); // Suoritetaan SQL-kysely, joka hakee käyttäjän sen ID:n perusteella
    },

    add: function(user_data, callback) { // Funktio, joka lisää uuden käyttäjän tietokantaan 
        return db.query('INSERT INTO user (firstname, lastname, pic_path) VALUES(?,?,?)', // Suoritetaan SQL-kysely, jossa lisätään uusi käyttäjä tietokantaan 
            [user_data.firstname, user_data.lastname, user_data.pic_path], callback); // Lisätään uusi käyttäjä tietokantaan 
    },

    delete: function(id, callback) { // Funktio, joka poistaa käyttäjän sen ID:n perusteella 
        return db.query('DELETE FROM user WHERE id_user=?', [id], callback); // Suoritetaan SQL-kysely, joka poistaa käyttäjän sen ID:n perusteella 
    },

    update: function(id, user_data, callback) { // Funktio, joka päivittää olemassa olevan käyttäjän tiedot 
        return db.query('UPDATE user SET firstname=?, lastname=?, pic_path=? WHERE id_user=?', // Suoritetaan SQL-kysely, joka päivittää olemassa olevan käyttäjän tiedot tietokantaan 
            [user_data.firstname, user_data.lastname, user_data.pic_path, id], callback); // Päivitetään olemassa olevan käyttäjän tiedot tietokantaan 
    }
};

module.exports = user; // Viedään "user"-olio käytettäväksi muissa tiedostoissa
