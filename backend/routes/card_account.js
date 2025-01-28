const express = require('express');
const router = express.Router();
const card_account = require('../models/card_account_model');

/**
 * @swagger
 * tags:
 *   name: CardAccount
 *   description: Card Account management
 */

/**
 * @swagger
 * /card_account:
 *   get:
 *     summary: Get all card accounts
 *     tags: [CardAccount]
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
router.get('/', function(request, response) {
    card_account.getAll(function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /card_account/{id}:
 *   get:
 *     summary: Get card account by ID
 *     tags: [CardAccount]
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
router.get('/:id', function(request, response) {
    card_account.getById(request.params.id, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /card_account:
 *   post:
 *     summary: Add a new card account
 *     tags: [CardAccount]
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
 *     responses:
 *       200:
 *         description: The created card account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', function(request, response) {
    card_account.add(request.body, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /card_account/{id}:
 *   put:
 *     summary: Update a card account
 *     tags: [CardAccount]
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
 *     responses:
 *       200:
 *         description: The updated card account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.put('/:id', function(request, response) {
    card_account.update(request.params.id, request.body, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /card_account/{id}:
 *   delete:
 *     summary: Delete a card account
 *     tags: [CardAccount]
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
router.delete('/:id', function(request, response) {
    card_account.delete(request.params.id, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

module.exports = router;