const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Card = require('../models/card_model');
const dotenv = require('dotenv');
const { logger } = require('../logger');

dotenv.config();

/**
 * @swagger
 * tags:
 *   name: ATM
 *   description: ATM operations
 */

/**
 * @swagger
 * /card_login:
 *   post:
 *     summary: Card login for ATM operations
 *     tags: [ATM]
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
 *     responses:
 *       200:
 *         description: User login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 card_number:
 *                   type: string
 */
router.post('/', (req, res) => {
    const { card_number, pin } = req.body;

    Card.getByCardNumber(card_number, (err, card) => {
        if (err) {
            logger.error(`Internal server error: ${err}`);
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (!card) {
            logger.warn(`Card not found for card number ${card_number}`);
            return res.status(401).json({ message: 'Invalid card number or pin' });
        }

        if (card.retrys >= 3) {
            logger.warn(`Card number ${card_number} is locked due to too many failed login attempts`);
            return res.status(403).json({ message: 'Card is locked due to too many failed login attempts' });
        }

        bcrypt.compare(pin, card.pin, (err, result) => {
            if (err) {
                logger.error(`Internal server error: ${err}`);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (!result) {
                Card.incrementRetries(card.id_card, (err) => {
                    if (err) {
                        logger.error(`Internal server error: ${err}`);
                        return res.status(500).json({ message: 'Internal server error' });
                    }
                    logger.warn(`Invalid pin for card number ${card_number}`);
                    return res.status(401).json({ message: 'Invalid card number or pin' });
                });
            } else {
                Card.resetRetries(card.id_card, (err) => {
                    if (err) {
                        logger.error(`Internal server error: ${err}`);
                        return res.status(500).json({ message: 'Internal server error' });
                    }
                    const token = jwt.sign({ id: card.id_card, role: 'user', card_number: card.card_number }, process.env.MY_TOKEN, { expiresIn: '3m' });
                    logger.info(`User logged in with card number ${card_number}`);
                    res.status(200).json({ token });
                });
            }
        });
    });
});

module.exports = router;
