const express = require('express'); // Tuodaan Express.js-kirjasto, joka mahdollistaa reititysten luomisen
const router = express.Router(); // Luodaan uusi reititin, joka käsittelee saapuvat HTTP-pyynnöt
const { verifyToken, restrictToAdmin } = require('../middleware/auth_middleware'); // Tuodaan autentikointiin liittyvät middlewaret, jotka tarkistavat käyttäjän kirjautumistilan ja roolin
const account = require('../models/account_model'); // Tuodaan account-malli, joka käsittelee tietokannan tilit

router.use(verifyToken); // Varmistetaan, että kaikki reitit vaativat käyttäjän kirjautumisen

/**
 * @swagger
 * tags:
 *   name: Account
 *   description: Account management
 */

/**
 * @swagger
 * /account:
 *   get:
 *     summary: Get all accounts
 *     tags: [Account]
 *     security:
 *       - adminBearerAuth: []
 *     responses:
 *       200:
 *         description: A list of accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       500:
 *         description: Internal server error
 */
router.get('/', restrictToAdmin, function(request, response) { // Reitti, joka hakee kaikki tilit
    account.getAll(function(err, result) { // Haetaan kaikki tilit tietokannasta
        if (err) { // Tarkistetaan, tapahtuiko virhe
            response.status(500).json({ error: 'Internal server error' }); // Virhetilanteessa palautetaan virheilmoitus
        } else { // Jos ei virhettä
            response.json(result); // Palauttaa yhteenvedon
        }
    });
});

/**
 * @swagger
 * /account/{id}:
 *   get:
 *     summary: Get account by ID
 *     tags: [Account]
 *     security:
 *       - adminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The account ID
 *     responses:
 *       200:
 *         description: An account object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', restrictToAdmin, function(request, response) { // Reitti, joka hakee tilin sen ID:n perusteella
    account.getById(request.params.id, function(err, result) { // Haetaan tili ID:n perusteella
        if (err) { // Virheen tarkistus
            response.status(500).json({ error: 'Internal server error' }); // Virhetilanteessa palautetaan virheilmoitus
        } else if (result.length === 0) { // Jos tiliä ei löydy
            response.status(404).json({ error: 'Account not found' }); // Palautetaan virheilmoitus, että tiliä ei löydy
        } else { // Jos tili löytyy
            response.json(result[0]); // Palauttaa yhteenvedon
        }
    });
});

/**
 * @swagger
 * /account/user/{id}:
 *   get:
 *     summary: Get accounts by user ID
 *     tags: [Account]
 *     security:
 *       - admin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A list of accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/user/:id', restrictToAdmin, function(request, response) { // Reitti, joka hakee tilit käyttäjän ID:n perusteella
    account.getByUserId(request.params.id, function(err, result) { // Haetaan tilit käyttäjän ID:n perusteella
        if (err) { // Virheen tarkistus
            response.json(err); // Virheilmoituksen palautus
        } else { // Jos tilit löytyvät
            response.json(result); // Palauttaa yhteenvedon
        }
    });
});

/**
 * @swagger
 * /account:
 *   post:
 *     summary: Add a new account
 *     tags: [Account]
 *     security:
 *       - adminBearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Account'
 *     responses:
 *       201:
 *         description: The created account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/', restrictToAdmin, function(request, response) { // Reitti, joka lisää uuden tilin
    account.add(request.body, function(err, result) { // Lisää uusi tili tietokantaan
        if (err) { // Virheen tarkistus
            response.status(500).json({ error: 'Internal server error' }); // Virheilmoitus virheen sattuessa
        } else { // Jos tili lisätään onnistuneesti
            response.status(201).json(result); // Palauttaa yhteenvedon
        }
    });
});

/**
 * @swagger
 * /account/{id}:
 *   put:
 *     summary: Update an account
 *     tags: [Account]
 *     security:
 *       - adminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Account'
 *     responses:
 *       200:
 *         description: The updated account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', restrictToAdmin, function(request, response) { // Reitti, joka päivittää tilin
    account.update(request.params.id, request.body, function(err, result) { // Päivitetään tili tietokantaan
        if (err) { // Virheen tarkistus
            response.status(500).json({ error: 'Internal server error' }); // Virheilmoitus virheen sattuessa
        } else if (result.affectedRows === 0) { // Jos tiliä ei löytynyt
            response.status(404).json({ error: 'Account not found' }); // Virheilmoitus, että tiliä ei löydy
        } else { // Jos tili on päivitetty onnistuneesti
            response.json(result); // Palautetaan yhteenveto
        }
    });
});

/**
 * @swagger
 * /account/{id}:
 *   delete:
 *     summary: Delete an account
 *     tags: [Account]
 *     security:
 *       - adminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The account ID
 *     responses:
 *       200:
 *         description: The deleted account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', restrictToAdmin, function(request, response) { // Reitti, joka poistaa tilin
    account.delete(request.params.id, function(err, result) { // Poistetaan tili tietokannasta
        if (err) { // Virheen tarkistus
            response.status(500).json({ error: 'Internal server error' }); // Virheilmoitus virheen sattuessa
        } else if (result.affectedRows === 0) { // Jos tiliä ei löytynyt
            response.status(404).json({ error: 'Account not found' }); // Virheilmoitus, että tiliä ei löydy
        } else { // Jos tili poistettiin onnistuneesti
            response.json(result); // Palautetaan yhteenveto
        }
    });
});

module.exports = router; // Viedään reititin muihin tiedostoihin käytettäväksi
