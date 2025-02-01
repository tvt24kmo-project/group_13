const express = require('express');
const router = express.Router();
const { verifyToken, restrictToAdmin } = require('../middleware/auth_middleware');
const card = require('../models/card_model');
const logger = require('../logger');

router.use(verifyToken);

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
router.get('/', restrictToAdmin, function(request, response) {
    card.getAll(function(err, result) {
        if (err) {
            logger.error(`Error fetching cards: ${err}`);
            response.json(err);
        } else {
            logger.info('Fetched all cards');
            response.json(result);
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
router.get('/:id', restrictToAdmin, function(request, response) {
    card.getById(request.params.id, function(err, result) {
        if (err) {
            logger.error(`Error fetching card by ID: ${err}`);
            response.json(err);
        } else {
            logger.info(`Fetched card by ID: ${request.params.id}`);
            response.json(result);
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
router.post('/', restrictToAdmin, function(request, response) {
    card.add(request.body, function(err, result) {
        if (err) {
            logger.error(`Error adding card: ${err}`);
            response.json(err);
        } else {
            logger.info('Added new card');
            response.json(result);
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
router.put('/:id', restrictToAdmin, function(request, response) {
    card.update(request.params.id, request.body, function(err, result) {
        if (err) {
            logger.error(`Error updating card: ${err}`);
            response.json(err);
        } else {
            logger.info(`Updated card with ID: ${request.params.id}`);
            response.json(result);
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
router.delete('/:id', restrictToAdmin, function(request, response) {
    card.delete(request.params.id, function(err, result) {
        if (err) {
            logger.error(`Error deleting card: ${err}`);
            response.json(err);
        } else {
            logger.info(`Deleted card with ID: ${request.params.id}`);
            response.json(result);
        }
    });
});

module.exports = router;