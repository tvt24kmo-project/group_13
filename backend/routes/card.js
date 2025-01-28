const express = require('express');
const router = express.Router();
const { verifyToken, restrictToUserAssets, checkCardAccess, restrictToAdmin } = require('../middleware/auth_middleware');
const card = require('../models/card_model');

router.use(verifyToken);
router.use(restrictToUserAssets);

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
 *       - user: []
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
router.get('/', checkCardAccess, function(request, response) {
    card.getAll(function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /card/type/{type}:
 *   get:
 *     summary: Get cards by type
 *     tags: [Card]
 *     security:
 *       - user: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: The card type (debit, credit, double)
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
router.get('/type/:type', checkCardAccess, function(request, response) {
    const cardType = request.params.type;
    card.getByType(cardType, function(err, result) {
        if (err) {
            response.json(err);
        } else {
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
 *       - user: []
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
router.get('/:id', checkCardAccess, function(request, response) {
    card.getById(request.params.id, function(err, result) {
        if (err) {
            response.json(err);
        } else {
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
 *               type:
 *                 type: string
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
            response.json(err);
        } else {
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
 *               type:
 *                 type: string
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
            response.json(err);
        } else {
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
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

module.exports = router;