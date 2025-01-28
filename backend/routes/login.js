const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const card = require('../models/card_model');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

/**
 * @swagger
 * tags:
 *   name: Login
 *   description: User login
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     tags: [Login]
 *     security:
 *       - card: []
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
router.post('/', function(request, response) {
    if (request.body.card_number && request.body.pin) {
        const card_number = request.body.card_number;
        const pin = request.body.pin;
        card.checkPin(card_number, function(dbError, dbResult) {
            if (dbError) {
                response.json(dbError);
            } else {
                if (dbResult.length > 0) {
                    bcrypt.compare(pin, dbResult[0].pin, function(err, compareResult) {
                        if (compareResult) {
                            const token = generateAccessToken({ card_number: card_number, role: 'user' }, '1800s');
                            response.send({ token: token, card_number: card_number });
                        } else {
                            response.send(false);
                        }
                    });
                } else {
                    response.send(false);
                }
            }
        });
    } else {
        response.send(false);
    }
});

function generateAccessToken(user, expiresIn) {
    dotenv.config();
    const token = jwt.sign(user, process.env.MY_TOKEN, { expiresIn: expiresIn });
    return token;
}

module.exports = router;
