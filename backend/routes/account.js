const express = require('express');
const router = express.Router();
const { verifyToken, restrictToAdmin } = require('../middleware/auth_middleware');
const account = require('../models/account_model');

router.use(verifyToken);

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
router.get('/', restrictToAdmin, function(request, response) {
    account.getAll(function(err, result) {
        if (err) {
            response.status(500).json({ error: 'Internal server error' });
        } else {
            response.json(result);
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
router.get('/:id', restrictToAdmin, function(request, response) {
    account.getById(request.params.id, function(err, result) {
        if (err) {
            response.status(500).json({ error: 'Internal server error' });
        } else if (result.length === 0) {
            response.status(404).json({ error: 'Account not found' });
        } else {
            response.json(result[0]);
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
router.get('/user/:id', restrictToAdmin, function(request, response) {
    account.getByUserId(request.params.id, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
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
router.post('/', restrictToAdmin, function(request, response) {
    account.add(request.body, function(err, result) {
        if (err) {
            response.status(500).json({ error: 'Internal server error' });
        } else {
            response.status(201).json(result);
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
router.put('/:id', restrictToAdmin, function(request, response) {
    account.update(request.params.id, request.body, function(err, result) {
        if (err) {
            response.status(500).json({ error: 'Internal server error' });
        } else if (result.affectedRows === 0) {
            response.status(404).json({ error: 'Account not found' });
        } else {
            response.json(result);
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
router.delete('/:id', restrictToAdmin, function(request, response) {
    account.delete(request.params.id, function(err, result) {
        if (err) {
            response.status(500).json({ error: 'Internal server error' });
        } else if (result.affectedRows === 0) {
            response.status(404).json({ error: 'Account not found' });
        } else {
            response.json(result);
        }
    });
});

module.exports = router;