const express = require('express'); // Tuodaan Express-kirjasto, joka mahdollistaa web-palvelimen luomisen
const router = express.Router(); // Luodaan uusi reititin Expressille
const { verifyToken, restrictToAdmin } = require('../middleware/auth_middleware'); // Tuodaan autentikointimiddlewaret, jotka tarkistavat käyttäjän tokenin ja rajoittavat pääsyn adminille
const transaction = require('../models/transaction_model'); // Tuodaan transaction-modeli, joka sisältää tietokantahaku- ja käsittelytoimintoja
const { logger } = require('../logger'); // Tuodaan logger, joka mahdollistaa virheiden ja tapahtumien lokitiedostoon kirjaamisen

router.use(verifyToken); // Lisätään verifyToken middleware, joka tarkistaa käyttäjän tunnistautumisen ennen pääsyä reitteihin

/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Transaction management
 */

/**
 * @swagger
 * /transaction:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transaction]
 *     security:
 *       - admin: []
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', restrictToAdmin, function(request, response) { // Reitti, joka hakee kaikki tapahtumat (adminin oikeuksilla)
    transaction.getAll(function(err, result) {
        if (err) {
            logger.error(`Error fetching transactions: ${err}`); // Kirjataan virhe, jos tapahtumien hakeminen epäonnistuu
            response.json(err); // Palautetaan virhe
        } else {
            logger.info('Fetched all transactions'); // Kirjataan onnistuminen
            response.json(result); // Palautetaan tapahtumat
        }
    });
});

/**
 * @swagger
 * /transaction/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transaction]
 *     security:
 *       - admin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The transaction ID
 *     responses:
 *       200:
 *         description: A transaction object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:id', restrictToAdmin, function(request, response) { // Reitti, joka hakee tapahtuman ID:n perusteella (adminin oikeuksilla)
    transaction.getById(request.params.id, function(err, result) {
        if (err) {
            logger.error(`Error fetching transaction by ID: ${err}`); // Kirjataan virhe
            response.json(err); // Palautetaan virhe
        } else {
            logger.info(`Fetched transaction by ID: ${request.params.id}`); // Kirjataan onnistuminen
            response.json(result); // Palautetaan tapahtuma
        }
    });
});

/**
 * @swagger
 * /transaction/account/{id}:
 *   get:
 *     summary: Get transactions by account ID
 *     tags: [Transaction]
 *     security:
 *       - admin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The account ID
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/account/:id', restrictToAdmin, function(request, response) { // Reitti, joka hakee tapahtumat tilin ID:n perusteella (adminin oikeuksilla)
    transaction.getByAccount(request.params.id, function(err, result) {
        if (err) {
            logger.error(`Error fetching transactions by account ID: ${err}`); // Kirjataan virhe
            response.json(err); // Palautetaan virhe
        } else {
            logger.info(`Fetched transactions by account ID: ${request.params.id}`); // Kirjataan onnistuminen
            response.json(result); // Palautetaan tapahtumat
        }
    });
});

/**
 * @swagger
 * /transaction:
 *   post:
 *     summary: Add a new transaction
 *     tags: [Transaction]
 *     security:
 *       - admin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transaction_type:
 *                 type: string
 *               sum:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *               type:
 *                 type: string
 *               id_account:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The created transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', restrictToAdmin, function(request, response) { // Reitti, joka lisää uuden tapahtuman (adminin oikeuksilla)
    transaction.add(request.body, function(err, result) {
        if (err) {
            logger.error(`Error adding transaction: ${err}`); // Kirjataan virhe, jos lisäys epäonnistuu
            response.json(err); // Palautetaan virhe
        } else {
            logger.info('Added new transaction'); // Kirjataan onnistuminen
            response.json(result); // Palautetaan lisätty tapahtuma
        }
    });
});

/**
 * @swagger
 * /transaction/{id}:
 *   put:
 *     summary: Update a transaction
 *     tags: [Transaction]
 *     security:
 *       - admin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transaction_type:
 *                 type: string
 *               sum:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *               type:
 *                 type: string
 *               id_account:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The updated transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.put('/:id', restrictToAdmin, function(request, response) { // Reitti, joka päivittää tapahtuman ID:n perusteella (adminin oikeuksilla)
    transaction.update(request.params.id, request.body, function(err, result) {
        if (err) {
            logger.error(`Error updating transaction: ${err}`); // Kirjataan virhe, jos päivitys epäonnistuu
            response.json(err); // Palautetaan virhe
        } else {
            logger.info(`Updated transaction with ID: ${request.params.id}`); // Kirjataan onnistuminen
            response.json(result); // Palautetaan päivitetty tapahtuma
        }
    });
});

/**
 * @swagger
 * /transaction/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transaction]
 *     security:
 *       - admin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The transaction ID
 *     responses:
 *       200:
 *         description: The deleted transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.delete('/:id', restrictToAdmin, function(request, response) { // Reitti, joka poistaa tapahtuman ID:n perusteella (adminin oikeuksilla)
    transaction.delete(request.params.id, function(err, result) {
        if (err) {
            logger.error(`Error deleting transaction: ${err}`); // Kirjataan virhe, jos poisto epäonnistuu
            response.json(err); // Palautetaan virhe
        } else {
            logger.info(`Deleted transaction with ID: ${request.params.id}`); // Kirjataan onnistuminen
            response.json(result); // Palautetaan poistettu tapahtuma
        }
    });
});

module.exports = router; // Viedään reititin ulos käyttöön
