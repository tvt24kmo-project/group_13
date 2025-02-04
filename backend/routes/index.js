const express = require('express'); // Tuodaan Express-kirjasto, joka mahdollistaa web-palvelimen luomisen
const router = express.Router(); // Luodaan uusi reititin Expressille, joka auttaa määrittämään HTTP-reittejä
const logger = require('../logger'); // Tuodaan logger, joka mahdollistaa virheiden ja tapahtumien lokitiedostoon kirjaamisen

/**
 * @swagger
 * tags:
 *   name: Index
 *   description: Index operations
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Index route
 *     tags: [Index]
 *     security:
 *       - user: []
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/', function(req, res, next) { // Reitti, joka käsittelee GET-pyynnön pääsivulle
    logger.info('Accessed index route'); // Kirjataan pääsivun reitin käyttö lokiin
    res.status(200).json({ message: 'Welcome to the Bank Automat API' }); // Palautetaan tervehdysviesti asiakkaalle
});

module.exports = router; // Viedään reititin ulos käyttöön

