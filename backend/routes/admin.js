const express = require('express'); // Tuodaan Express-kirjasto, joka mahdollistaa web-palvelimen luomisen
const router = express.Router(); // Luodaan uusi reititin Expressille
const { verifyToken, restrictToAdmin } = require('../middleware/auth_middleware'); // Tuodaan autentikointimiddlewaret, jotka tarkistavat käyttäjän tokenin ja rajoittavat pääsyn adminille
const Admin = require('../models/admin_model'); // Tuodaan Admin-malli, joka määrittelee adminin tietokannan rakenteen
const { logger } = require('../logger'); // Tuodaan logger, joka mahdollistaa virheiden ja tapahtumien lokitiedostoon kirjaamisen

router.use(verifyToken); // Lisätään verifyToken middleware, joka tarkistaa käyttäjän tunnistautumisen ennen pääsyä reitteihin

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management
 */

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Get all admins
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of admins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', restrictToAdmin, function(request, response) { // Reitti, joka hakee kaikki adminit (adminin oikeuksilla)
    Admin.getAll(function(err, result) {
        if (err) {
            logger.error(`Error fetching admins: ${err}`); // Kirjataan virhe, jos adminien haku epäonnistuu
            response.status(500).json(err); // Palautetaan virhe
        } else {
            logger.info('Fetched all admins'); // Kirjataan onnistuminen
            response.status(200).json(result); // Palautetaan adminit
        }
    });
});

/**
 * @swagger
 * /admin/{id}:
 *   get:
 *     summary: Get admin by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The admin ID
 *     responses:
 *       200:
 *         description: An admin object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:id', restrictToAdmin, function(request, response) { // Reitti, joka hakee adminin ID:n perusteella (adminin oikeuksilla)
    Admin.getById(request.params.id, function(err, result) {
        if (err) {
            logger.error(`Error fetching admin by ID: ${err}`); // Kirjataan virhe
            response.status(500).json(err); // Palautetaan virhe
        } else {
            logger.info(`Fetched admin by ID: ${request.params.id}`); // Kirjataan onnistuminen
            response.status(200).json(result); // Palautetaan admin
        }
    });
});

/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Add a new admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *         description: The created admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', restrictToAdmin, function(request, response) { // Reitti, joka lisää uuden adminin (adminin oikeuksilla)
    const { username, password } = request.body;
    Admin.add({ username, password }, function(err, result) {
        if (err) {
            logger.error(`Error adding admin: ${err}`); // Kirjataan virhe, jos lisäys epäonnistuu
            response.status(500).json(err); // Palautetaan virhe
        } else {
            logger.info('Added new admin'); // Kirjataan onnistuminen
            response.status(200).json(result); // Palautetaan lisätty admin
        }
    });
});

/**
 * @swagger
 * /admin/{id}:
 *   put:
 *     summary: Update an admin's password by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.put('/:id', restrictToAdmin, function(request, response) { // Reitti, joka päivittää adminin salasanan ID:n perusteella (adminin oikeuksilla)
    const { password } = request.body;
    Admin.updatePassword(request.params.id, password, function(err, result) {
        if (err) {
            logger.error(`Error updating admin password: ${err}`); // Kirjataan virhe, jos päivitys epäonnistuu
            response.status(500).json(err); // Palautetaan virhe
        } else {
            logger.info(`Updated admin password with ID: ${request.params.id}`); // Kirjataan onnistuminen
            response.status(200).json(result); // Palautetaan päivitetty admin
        }
    });
});

/**
 * @swagger
 * /admin/{id}:
 *   delete:
 *     summary: Delete an admin by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The admin ID
 *     responses:
 *       200:
 *         description: The deleted admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.delete('/:id', restrictToAdmin, function(request, response) { // Reitti, joka poistaa adminin ID:n perusteella (adminin oikeuksilla)
    Admin.delete(request.params.id, function(err, result) {
        if (err) {
            logger.error(`Error deleting admin: ${err}`); // Kirjataan virhe, jos poisto epäonnistuu
            response.status(500).json(err); // Palautetaan virhe
        } else {
            logger.info(`Deleted admin with ID: ${request.params.id}`); // Kirjataan onnistuminen
            response.status(200).json(result); // Palautetaan poistettu admin
        }
    });
});

module.exports = router; // Viedään reititin ulos käyttöön
