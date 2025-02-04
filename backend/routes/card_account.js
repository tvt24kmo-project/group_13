const express = require('express'); // Tuodaan Express-kirjasto, joka mahdollistaa web-palvelimen luomisen
const router = express.Router(); // Luodaan uusi reititin Expressille, joka auttaa määrittämään HTTP-reittejä
const { verifyToken, restrictToAdmin } = require('../middleware/auth_middleware'); // Tuodaan autentikointimiddleware, joka tarkistaa käyttäjän tunnisteen ja rajoittaa pääsyn admin-käyttäjille
const cardAccount = require('../models/card_account_model'); // Tuodaan CardAccount-malli, joka määrittelee korttitilitietokannan rakenteen
const logger = require('../logger'); // Tuodaan logger, joka mahdollistaa virheiden ja tapahtumien lokitiedostoon kirjaamisen

router.use(verifyToken); // Käytetään verifyToken-middlewarea kaikille reiteille, joka varmistaa, että käyttäjä on autentikoitu

/**
 * @swagger
 * tags:
 *   name: CardAccount
 *   description: Card account management
 */

/**
 * @swagger
 * /card_account:
 *   get:
 *     summary: Get all card accounts
 *     tags: [CardAccount]
 *     security:
 *       - admin: []
 *     responses:
 *       200:
 *         description: A list of card accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', restrictToAdmin, function(request, response) { // Reitti, joka hakee kaikki korttitilit
    cardAccount.getAll(function(err, result) { // Haetaan kaikki korttitilit CardAccount-mallin getAll-funktiolla
        if (err) { // Jos virhe ilmenee, palautetaan virheilmoitus
            logger.error(`Error fetching card accounts: ${err}`); // Kirjataan virhe lokiin
            response.json(err); // Palautetaan virhe käyttäjälle
        } else {
            logger.info('Fetched all card accounts'); // Kirjataan lokiin, että kaikki korttitilit haettiin onnistuneesti
            response.json(result); // Palautetaan korttitilit JSON-muodossa
        }
    });
});

/**
 * @swagger
 * /card_account/{id}:
 *   get:
 *     summary: Get card account by ID
 *     tags: [CardAccount]
 *     security:
 *       - admin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The card account ID
 *     responses:
 *       200:
 *         description: A card account object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:id', restrictToAdmin, function(request, response) { // Reitti, joka hakee korttitilin ID:n perusteella
    cardAccount.getById(request.params.id, function(err, result) { // Haetaan korttitili ID:n perusteella CardAccount-mallin getById-funktiolla
        if (err) { // Jos virhe ilmenee, palautetaan virheilmoitus
            logger.error(`Error fetching card account by ID: ${err}`); // Kirjataan virhe lokiin
            response.json(err); // Palautetaan virhe käyttäjälle
        } else {
            logger.info(`Fetched card account by ID: ${request.params.id}`); // Kirjataan lokiin, että korttitili haettiin onnistuneesti ID:n perusteella
            response.json(result); // Palautetaan korttitili JSON-muodossa
        }
    });
});

/**
 * @swagger
 * /card_account:
 *   post:
 *     summary: Add a new card account
 *     tags: [CardAccount]
 *     security:
 *       - admin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_card:
 *                 type: integer
 *               id_account:
 *                 type: integer
 *               account_type:
 *                 type: string
 *                 enum: [credit, debit]
 *     responses:
 *       200:
 *         description: The created card account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', restrictToAdmin, function(request, response) { // Reitti, joka lisää uuden korttitilin
    cardAccount.add(request.body, function(err, result) { // Lisätään uusi korttitili CardAccount-mallin add-funktiolla
        if (err) { // Jos virhe ilmenee, palautetaan virheilmoitus
            logger.error(`Error adding card account: ${err}`); // Kirjataan virhe lokiin
            response.json(err); // Palautetaan virhe käyttäjälle
        } else {
            logger.info('Added new card account'); // Kirjataan lokiin, että uusi korttitili lisättiin onnistuneesti
            response.json(result); // Palautetaan uusi korttitili JSON-muodossa
        }
    });
});

/**
 * @swagger
 * /card_account/{id}:
 *   put:
 *     summary: Update a card account
 *     tags: [CardAccount]
 *     security:
 *       - admin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The card account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_card:
 *                 type: integer
 *               id_account:
 *                 type: integer
 *               account_type:
 *                 type: string
 *                 enum: [credit, debit]
 *     responses:
 *       200:
 *         description: The updated card account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.put('/:id', restrictToAdmin, function(request, response) { // Reitti, joka päivittää korttitilin tiedot
    cardAccount.update(request.params.id, request.body, function(err, result) { // Päivitetään korttitili ID:n perusteella CardAccount-mallin update-funktiolla
        if (err) { // Jos virhe ilmenee, palautetaan virheilmoitus
            logger.error(`Error updating card account: ${err}`); // Kirjataan virhe lokiin
            response.json(err); // Palautetaan virhe käyttäjälle
        } else {
            logger.info(`Updated card account with ID: ${request.params.id}`); // Kirjataan lokiin, että korttitili päivitettiin onnistuneesti
            response.json(result); // Palautetaan päivitetty korttitili JSON-muodossa
        }
    });
});

/**
 * @swagger
 * /card_account/{id}:
 *   delete:
 *     summary: Delete a card account
 *     tags: [CardAccount]
 *     security:
 *       - admin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The card account ID
 *     responses:
 *       200:
 *         description: The deleted card account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.delete('/:id', restrictToAdmin, function(request, response) { // Reitti, joka poistaa korttitilin
    cardAccount.delete(request.params.id, function(err, result) { // Poistetaan korttitili ID:n perusteella CardAccount-mallin delete-funktiolla
        if (err) { // Jos virhe ilmenee, palautetaan virheilmoitus
            logger.error(`Error deleting card account: ${err}`); // Kirjataan virhe lokiin
            response.json(err); // Palautetaan virhe käyttäjälle
        } else {
            logger.info(`Deleted card account with ID: ${request.params.id}`); // Kirjataan lokiin, että korttitili poistettiin onnistuneesti
            response.json(result); // Palautetaan poistettu korttitili JSON-muodossa
        }
    });
});

module.exports = router; // Viedään reititin ulos käyttöön
