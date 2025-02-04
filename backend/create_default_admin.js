const dotenv = require('dotenv'); // Tuodaan dotenv-kirjasto, joka mahdollistaa ympäristömuuttujien käytön .env-tiedostosta
const db = require('./database'); // Tuodaan tietokantamodule, joka huolehtii tietokantakyselyistä
const bcrypt = require('bcrypt'); // Tuodaan bcrypt-kirjasto, joka huolehtii salasanan salauksesta

dotenv.config(); // Ladataan ympäristömuuttujat .env-tiedostosta

// Funktio, joka luo oletusadmin-käyttäjän tietokantaan, jos sellaista ei ole vielä
async function createDefaultAdmin() {
    const adminId = 1; // Asetetaan oletusadminin ID
    const username = process.env.INITIAL_ADMIN_USERNAME; // Haetaan adminin käyttäjätunnus ympäristömuuttujista
    const password = process.env.INITIAL_ADMIN_PASSWORD; // Haetaan adminin salasana ympäristömuuttujista

    try {
        // Tarkistetaan, onko admin ID:llä 1 jo olemassa tietokannassa
        const [existingAdmin] = await db.query('SELECT * FROM admins WHERE id_admin = ?', [adminId]);
        if (existingAdmin.length > 0) {
            console.log('Admin with ID 1 already exists. Script will now exit.'); // Jos admin on jo olemassa, tulostetaan viesti ja lopetetaan skripti
            process.exit(0);
        }

        // Salataan salasana bcryptillä ennen tallentamista
        console.log(`Creating default admin with username: ${username} and password: ${password}`); // Tulostetaan selkokielinen salasana
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(`Hashed password: ${hashedPassword}`); // Tulostetaan hashattu salasana
        if (!hashedPassword) {
            throw new Error('Password hashing failed');
        }

        // Lisätään uusi admin-käyttäjä tietokantaan
        await db.query('INSERT INTO admins (id_admin, username, password) VALUES (?, ?, ?)', [adminId, username, hashedPassword]);
        console.log('Default admin user created successfully.'); // Kirjataan onnistuminen
        process.exit(0); // Lopetetaan skripti onnistuneen suorituksen jälkeen
    } catch (err) {
        console.error('Error creating default admin user:', err.message); // Kirjataan virhe, jos jotain menee pieleen
        process.exit(1); // Lopetetaan skripti virheen sattuessa
    }
}

// Kutsutaan funktiota, joka luo oletusadmin-käyttäjän
createDefaultAdmin();

