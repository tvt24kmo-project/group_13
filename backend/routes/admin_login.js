const express = require('express'); // Tuodaan Express-kirjasto, joka mahdollistaa web-palvelimen luomisen
const router = express.Router(); // Luodaan uusi reititin Expressille, joka auttaa määrittämään HTTP-reittejä
const jwt = require('jsonwebtoken'); // Tuodaan jsonwebtoken-kirjasto JWT-tunnisteiden luomiseen ja tarkistamiseen
const bcrypt = require('bcrypt'); // Tuodaan bcrypt-kirjasto, joka on salausalgoritmi salasanan salaamiseen ja vertailuun
const Admin = require('../models/admin_model'); // Tuodaan Admin-malli, joka määrittelee adminin tietokannan rakenteen
const dotenv = require('dotenv'); // Tuodaan dotenv-kirjasto ympäristömuuttujien hallintaan
const { logger } = require('../logger'); // Tuodaan logger-moduuli, joka mahdollistaa virheiden ja muiden tapahtumien lokituksen

dotenv.config(); // Alustetaan dotenv-kirjasto, joka lataa ympäristömuuttujat .env-tiedostosta

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin operations
 */

/**
 * @swagger
 * /admin_login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
router.post('/', (req, res) => { // Määritellään POST-pyyntö reitille '/', joka käsittelee kirjautumispyynnön
    const { username, password } = req.body; // Haetaan käyttäjänimi ja salasana pyynnön body-osiosta

    Admin.getByUsername(username, (err, admin) => { // Haetaan admin käyttäjänimen perusteella
        if (err) { // Jos tulee virhe, palautetaan virheilmoitus
            logger.error(`Sisäinen palvelinvirhe: ${err}`); // Kirjataan virheilmoitus lokiin
            return res.status(500).json({ message: 'Sisäinen palvelinvirhe' }); // Palautetaan statuskoodi 500 ja virheilmoitus
        }
        if (!admin) { // Jos adminia ei löydy tietokannasta
            logger.warn(`Virheellinen käyttäjänimi tai salasana käyttäjälle ${username}`); // Kirjataan varoitus lokiin
            return res.status(401).json({ message: 'Virheellinen käyttäjänimi tai salasana' }); // Palautetaan statuskoodi 401 ja virheilmoitus
        }

        if (!admin.password) { // Jos adminin salasanaa ei löydy tietokannasta
            logger.warn(`Salasana puuttuu käyttäjältä ${username}`); // Kirjataan varoitus lokiin
            return res.status(401).json({ message: 'Virheellinen käyttäjänimi tai salasana' }); // Palautetaan statuskoodi 401 ja virheilmoitus
        }

        const sanitizedHash = admin.password.replace(/_/g, '/').replace(/-/g, '.');
        bcrypt.compare(password.trim(), sanitizedHash, (err, isMatch) => {
            if (err) { // Jos tulee virhe, palautetaan virheilmoitus
                logger.error(`Sisäinen palvelinvirhe: ${err}`); // Kirjataan virheilmoitus lokiin
                return res.status(500).json({ message: 'Sisäinen palvelinvirhe' }); // Palautetaan statuskoodi 500 ja virheilmoitus
            }
            if (!isMatch) { // Jos salasanat eivät täsmää
                logger.warn(`Virheellinen käyttäjänimi tai salasana käyttäjälle ${username}`); // Kirjataan varoitus lokiin
                return res.status(401).json({ message: 'Virheellinen käyttäjänimi tai salasana' }); // Palautetaan statuskoodi 401 ja virheilmoitus
            }

            const token = jwt.sign({ id: admin.id_admin, role: 'admin' }, process.env.MY_TOKEN, { expiresIn: '15m' }); // Luodaan JWT-tunniste, joka sisältää adminin ID:n ja roolin ('admin'), sekä asetetaan tunnisteen vanhentumisajaksi 15 minuuttia. Salausavain otetaan ympäristömuuttujasta (MY_TOKEN)
            logger.info(`Admin kirjautui sisään käyttäjänimellä ${username}`); // Kirjataan lokiin tieto siitä, että admin on kirjautunut sisään annetulla käyttäjätunnuksella
            res.status(200).json({ token }); // Palautetaan luotu JWT-tunniste vastauksena statuskoodilla 200
        });
    });
});

module.exports = router; // Viedään reititin käytettäväksi muissa moduuleissa

