const express = require('express'); // Tuodaan Express-kirjasto, joka mahdollistaa web-palvelimen luomisen
const router = express.Router(); // Luodaan uusi reititin Expressille, joka auttaa määrittämään HTTP-reittejä
const jwt = require('jsonwebtoken'); // Tuodaan jsonwebtoken, joka mahdollistaa JWT-tunnisteiden luomisen ja tarkistamisen
const bcrypt = require('bcrypt'); // Tuodaan bcrypt, joka mahdollistaa salasanan hashauksen ja tarkistamisen
const Card = require('../models/card_model'); // Tuodaan Card-malli, joka hallitsee korttitietokannan toimintaa
const dotenv = require('dotenv'); // Tuodaan dotenv, joka mahdollistaa ympäristömuuttujien käyttämisen
const { logger } = require('../logger'); // Tuodaan logger, joka mahdollistaa virheiden ja tapahtumien lokitiedostoon kirjaamisen

dotenv.config(); // Ladataan ympäristömuuttujat .env-tiedostosta

/**
 * @swagger
 * tags:
 *   name: ATM
 *   description: ATM operations
 */

/**
 * @swagger
 * /card_login:
 *   post:
 *     summary: Card login for ATM operations
 *     tags: [ATM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               card_number:
 *                 type: string
 *               pin:
 *                 type: string
 *     responses:
 *       200:
 *         description: User login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 card_number:
 *                   type: string
 */
router.post('/', (req, res) => { // Reitti, joka hoitaa kortin kirjautumisoperaation
    const { card_number, pin } = req.body; // Haetaan kortin numero ja PIN-koodi pyyntöruumiista

    Card.getByCardNumber(card_number, (err, card) => { // Haetaan kortti Card-mallin getByCardNumber-funktiolla kortin numeron perusteella
        if (err) { // Jos virhe ilmenee tietokannan kyselyssä, palautetaan virheilmoitus
            logger.error(`Internal server error: ${err}`); // Kirjataan virhe lokiin
            return res.status(500).json({ message: 'Internal server error' }); // Palautetaan virheilmoitus
        }
        if (!card) { // Jos korttia ei löydy, palautetaan virheilmoitus
            logger.warn(`Card not found for card number ${card_number}`); // Kirjataan lokiin, että korttia ei löytynyt
            return res.status(401).json({ message: 'Invalid card number or pin' }); // Palautetaan virheellinen kortti- tai PIN-tieto
        }

        if (card.retrys >= 3) { // Jos kortti on lukittu liian monen epäonnistuneen kirjautumisyrityksen jälkeen
            logger.warn(`Card number ${card_number} is locked due to too many failed login attempts`); // Kirjataan kortin lukitsemisesta lokiin
            return res.status(403).json({ message: 'Card is locked due to too many failed login attempts' }); // Palautetaan virheilmoitus kortin lukitsemisesta
        }

        bcrypt.compare(pin, card.pin, (err, result) => { // Vertailaan syötetty PIN-koodi salattuun PIN-koodiin bcryptin avulla
            if (err) { // Jos virhe ilmenee PIN-koodin tarkistuksessa
                logger.error(`Internal server error: ${err}`); // Kirjataan virhe lokiin
                return res.status(500).json({ message: 'Internal server error' }); // Palautetaan virheilmoitus
            }
            if (!result) { // Jos PIN-koodi ei täsmää
                Card.incrementRetries(card.id_card, (err) => { // Kasvatetaan epäonnistuneiden kirjautumisyritysten laskuria
                    if (err) { // Jos virhe ilmenee epäonnistumisten laskemisessa
                        logger.error(`Internal server error: ${err}`); // Kirjataan virhe lokiin
                        return res.status(500).json({ message: 'Internal server error' }); // Palautetaan virheilmoitus
                    }
                    logger.warn(`Invalid pin for card number ${card_number}`); // Kirjataan lokiin väärä PIN
                    return res.status(401).json({ message: 'Invalid card number or pin' }); // Palautetaan virheellinen kortti- tai PIN-tieto
                });
            } else { // Jos PIN-koodi on oikea
                Card.resetRetries(card.id_card, (err) => { // Nollataan epäonnistuneiden kirjautumisyritysten laskuri
                    if (err) { // Jos virhe ilmenee laskurin nollauksessa
                        logger.error(`Internal server error: ${err}`); // Kirjataan virhe lokiin
                        return res.status(500).json({ message: 'Internal server error' }); // Palautetaan virheilmoitus
                    }
                    const token = jwt.sign({ id: card.id_card, role: 'user', card_number: card.card_number }, process.env.MY_TOKEN, { expiresIn: '3m' }); // Luodaan JWT-token käyttäjälle
                    logger.info(`User logged in with card number ${card_number}`); // Kirjataan onnistunut kirjautuminen lokiin
                    res.status(200).json({ token }); // Palautetaan käyttäjälle token
                });
            }
        });
    });
});

module.exports = router; // Viedään reititin ulos käyttöön
