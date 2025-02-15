const express = require('express'); // Tuodaan Express-kirjasto, joka mahdollistaa web-palvelimen luomisen
const router = express.Router(); // Luodaan uusi reititin Expressille, joka auttaa määrittämään HTTP-reittejä
const { verifyToken, restrictToAdmin } = require('../middleware/auth_middleware'); // Tuodaan toiminnot käyttäjän autentikointiin ja roolien rajoittamiseen
const card = require('../models/card_model'); // Tuodaan Card-malli, joka hallitsee korttitietokannan toimintaa
const { logger } = require('../logger'); // Tuodaan logger, joka mahdollistaa virheiden ja tapahtumien lokitiedostoon kirjaamisen

router.use(verifyToken); // Käytetään verifyToken-middlewarea varmistaaksemme, että käyttäjällä on voimassa oleva tunniste ennen reitteihin pääsyä

/**
 * @swagger
 * tags:
 *   name: Card
 *   description: Card management
 */

/**
 * @swagger
 * /card:
 *   get:
 *     summary: Get all cards
 *     tags: [Card]
 *     security:
 *       - admin: []
 *     responses:
 *       200:
 *         description: A list of cards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', restrictToAdmin, function(request, response) { // Reitti, joka hakee kaikki kortit
    card.getAll(function(err, result) { // Haetaan kaikki kortit Card-mallin getAll-funktiolla
        if (err) { // Jos virhe ilmenee tietokannan kyselyssä
            logger.error(`Error fetching cards: ${err}`); // Kirjataan virhe lokiin
            response.json(err); // Palautetaan virheilmoitus
        } else {
            logger.info('Fetched all cards'); // Kirjataan onnistunut pyyntö lokiin
            response.json(result); // Palautetaan korttien tiedot vastauksessa
        }
    });
});

/**
 * @swagger
 * /card/{id}:
 *   get:
 *     summary: Get card by ID
 *     tags: [Card]
 *     security:
 *       - admin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The card ID
 *     responses:
 *       200:
 *         description: A card object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:id', restrictToAdmin, function(request, response) { // Reitti, joka hakee kortin ID:n perusteella
    card.getById(request.params.id, function(err, result) { // Haetaan kortti Card-mallin getById-funktiolla kortin ID:n perusteella
        if (err) { // Jos virhe ilmenee kortin hakemisessa
            logger.error(`Error fetching card by ID: ${err}`); // Kirjataan virhe lokiin
            response.json(err); // Palautetaan virheilmoitus
        } else {
            logger.info(`Fetched card by ID: ${request.params.id}`); // Kirjataan onnistunut kortin haku lokiin
            response.json(result); // Palautetaan haettu kortti vastauksessa
        }
    });
});

/**
 * @swagger
 * /card:
 *   post:
 *     summary: Add a new card
 *     tags: [Card]
 *     security:
 *       - admin: []
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
 *               retrys:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The created card
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', restrictToAdmin, function(request, response) { // Reitti, joka lisää uuden kortin
    card.add(request.body, function(err, result) { // Lisätään kortti Card-mallin add-funktiolla
        if (err) { // Jos virhe ilmenee kortin lisäämisessä
            logger.error(`Error adding card: ${err}`); // Kirjataan virhe lokiin
            response.json(err); // Palautetaan virheilmoitus
        } else {
            logger.info('Added new card'); // Kirjataan onnistunut kortin lisäys lokiin
            response.json(result); // Palautetaan lisätty kortti vastauksessa
        }
    });
});

/**
 * @swagger
 * /card/{id}:
 *   put:
 *     summary: Update a card
 *     tags: [Card]
 *     security:
 *       - admin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The card ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pin:
 *                 type: string
 *               retrys:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The updated card
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.put('/:id', restrictToAdmin, function(request, response) { // Reitti, joka päivittää kortin tiedot
    card.update(request.params.id, request.body, function(err, result) { // Päivitetään kortti Card-mallin update-funktiolla kortin ID:n ja uusien tietojen perusteella
        if (err) { // Jos virhe ilmenee kortin päivittämisessä
            logger.error(`Error updating card: ${err}`); // Kirjataan virhe lokiin
            response.json(err); // Palautetaan virheilmoitus
        } else {
            logger.info(`Updated card with ID: ${request.params.id}`); // Kirjataan onnistunut kortin päivitys lokiin
            response.json(result); // Palautetaan päivitetty kortti vastauksessa
        }
    });
});

/**
 * @swagger
 * /card/{id}:
 *   delete:
 *     summary: Delete a card
 *     tags: [Card]
 *     security:
 *       - admin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The card ID
 *     responses:
 *       200:
 *         description: The deleted card
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.delete('/:id', restrictToAdmin, function(request, response) { // Reitti, joka poistaa kortin ID:n perusteella
    card.delete(request.params.id, function(err, result) { // Poistetaan kortti Card-mallin delete-funktiolla kortin ID:n perusteella
        if (err) { // Jos virhe ilmenee kortin poistamisessa
            logger.error(`Error deleting card: ${err}`); // Kirjataan virhe lokiin
            response.json(err); // Palautetaan virheilmoitus
        } else {
            logger.info(`Deleted card with ID: ${request.params.id}`); // Kirjataan onnistunut kortin poisto lokiin
            response.json(result); // Palautetaan poistetun kortin tiedot vastauksessa
        }
    });
});

module.exports = router; // Viedään reititin ulos käyttöön
