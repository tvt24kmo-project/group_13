const express = require('express'); // Tuodaan Express-kirjasto, joka mahdollistaa web-palvelimen luomisen
const router = express.Router(); // Luodaan uusi reititin Expressille
const { verifyToken, restrictToAdmin } = require('../middleware/auth_middleware'); // Tuodaan autentikointimiddlewaret, jotka tarkistavat käyttäjän tokenin ja rajoittavat pääsyn adminille
const user = require('../models/user_model'); // Tuodaan user-modeli, joka sisältää tietokantahaku- ja käsittelytoimintoja
// Muutetaan logger importtaus
const { logger } = require('../logger'); // Tuodaan logger, joka mahdollistaa virheiden ja tapahtumien lokitiedostoon kirjaamisen

router.use(verifyToken); // Lisätään verifyToken middleware, joka tarkistaa käyttäjän tunnistautumisen ennen pääsyä reitteihin

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', restrictToAdmin, function(request, response) { // Reitti, joka hakee kaikki käyttäjät (adminin oikeuksilla)
    user.getAll(function(err, result) {
        if (err) {u
            logger.error(`Error fetching users: ${err}`); // Kirjataan virhe, jos käyttäjien haku epäonnistuu
            response.json(err); // Palautetaan virhe
        } else {
            logger.info('Fetched all users'); // Kirjataan onnistuminen
            response.json(result); // Palautetaan käyttäjät
        }
    });
});

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A user object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:id', restrictToAdmin, function(request, response) { // Reitti, joka hakee käyttäjän ID:n perusteella (adminin oikeuksilla)
    user.getById(request.params.id, function(err, result) {
        if (err) {
            logger.error(`Error fetching user by ID: ${err}`); // Kirjataan virhe
            response.json(err); // Palautetaan virhe
        } else {
            logger.info(`Fetched user by ID: ${request.params.id}`); // Kirjataan onnistuminen
            response.json(result); // Palautetaan käyttäjä
        }
    });
});

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Add a new user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               pic_path:
 *                 type: string
 *     responses:
 *       200:
 *         description: The created user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', restrictToAdmin, function(request, response) { // Reitti, joka lisää uuden käyttäjän (adminin oikeuksilla)
    user.add(request.body, function(err, result) {
        if (err) {
            logger.error(`Error adding user: ${err}`); // Kirjataan virhe, jos lisäys epäonnistuu
            response.json(err); // Palautetaan virhe
        } else {
            logger.info('Added new user'); // Kirjataan onnistuminen
            response.json(result); // Palautetaan lisätty käyttäjä
        }
    });
});

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               pic_path:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.put('/:id', restrictToAdmin, function(request, response) { // Reitti, joka päivittää käyttäjän ID:n perusteella (adminin oikeuksilla)
    user.update(request.params.id, request.body, function(err, result) {
        if (err) {
            logger.error(`Error updating user: ${err}`); // Kirjataan virhe, jos päivitys epäonnistuu
            response.json(err); // Palautetaan virhe
        } else {
            logger.info(`Updated user with ID: ${request.params.id}`); // Kirjataan onnistuminen
            response.json(result); // Palautetaan päivitetty käyttäjä
        }
    });
});

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The deleted user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.delete('/:id', restrictToAdmin, function(request, response) { // Reitti, joka poistaa käyttäjän ID:n perusteella (adminin oikeuksilla)
    user.delete(request.params.id, function(err, result) {
        if (err) {
            logger.error(`Error deleting user: ${err}`); // Kirjataan virhe, jos poisto epäonnistuu
            response.json(err); // Palautetaan virhe
        } else {
            logger.info(`Deleted user with ID: ${request.params.id}`); // Kirjataan onnistuminen
            response.json(result); // Palautetaan poistettu käyttäjä
        }
    });
});

module.exports = router; // Viedään reititin ulos käyttöön
