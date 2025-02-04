const dotenv = require('dotenv'); // Tuodaan dotenv-kirjasto ympäristömuuttujien hallintaan
const mysql = require('mysql2'); // Tuodaan mysql2-kirjasto tietokantayhteyden luomiseen

dotenv.config(); // Ladataan ympäristömuuttujat .env-tiedostosta

const connection = mysql.createPool({ // Luodaan tietokantayhteyspooli
    uri: process.env.SQL_SERVER // Käytetään ympäristömuuttujasta haettua tietokantapalvelimen URI:a
});

connection.getConnection((err, conn) => { // Yritetään muodostaa yhteys tietokantaan
    if (err) { // Jos yhteyden muodostamisessa tapahtuu virhe
        console.error('Error connecting to the database:', err); // Tulostetaan virheilmoitus
        process.exit(1); // Lopetetaan prosessi virhekoodilla 1
    } else { // Jos yhteys muodostetaan onnistuneesti
        console.log('Connected to the database.'); // Tulostetaan onnistumisviesti
        conn.release(); // Vapautetaan yhteys takaisin pooliin
    }
});

module.exports = connection; // Viedään tietokantayhteys käytettäväksi muissa tiedostoissa