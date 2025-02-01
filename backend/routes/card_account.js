const express = require('express');
const router = express.Router();
const { verifyToken, restrictToAdmin } = require('../middleware/auth_middleware');
const cardAccount = require('../models/card_account_model');
const logger = require('../logger');

router.use(verifyToken);

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
router.get('/', restrictToAdmin, function(request, response) {
    cardAccount.getAll(function(err, result) {
        if (err) {
            logger.error(`Error fetching card accounts: ${err}`);
            response.json(err);
        } else {
            logger.info('Fetched all card accounts');
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
router.get('/:id', restrictToAdmin, function(request, response) {
    cardAccount.getById(request.params.id, function(err, result) {
        if (err) {
            logger.error(`Error fetching card account by ID: ${err}`);
            response.json(err);
        } else {
            logger.info(`Fetched card account by ID: ${request.params.id}`);
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
router.post('/', restrictToAdmin, function(request, response) {
    cardAccount.add(request.body, function(err, result) {
        if (err) {
            logger.error(`Error adding card account: ${err}`);
            response.json(err);
        } else {
            logger.info('Added new card account');
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
router.put('/:id', restrictToAdmin, function(request, response) {
    cardAccount.update(request.params.id, request.body, function(err, result) {
        if (err) {
            logger.error(`Error updating card account: ${err}`);
            response.json(err);
        } else {
            logger.info(`Updated card account with ID: ${request.params.id}`);
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
router.delete('/:id', restrictToAdmin, function(request, response) {
    cardAccount.delete(request.params.id, function(err, result) {
        if (err) {
            logger.error(`Error deleting card account: ${err}`);
            response.json(err);
        } else {
            logger.info(`Deleted card account with ID: ${request.params.id}`);
            response.json(result);
        }
    });
});

module.exports = router;